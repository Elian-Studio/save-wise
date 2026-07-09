// 청년 지원금 통합 자격진단 엔진 — 순수 함수(SSR 결정적). transitSchemeRec 미러.
// 정직성: 검증 불가한 법정 조건(재산·개인 연소득)·미확정([R]) 항목은 eligible로 단정하지 않고 likely로 강등한다.
// 근거: docs/youth-benefits-spec.md §1 A1~A4, §2.
import type { Household, IncomeBucket, Cta, RelatedCard, EndedProgram } from '../data/youthBenefits';
import { MEDIAN_INCOME_2026, INCOME_REP, BENEFITS, RELATED, ENDED } from '../data/youthBenefits';

export interface QuizAnswers {
  age: 'u19' | 'y2024' | 'y2529' | 'y3034' | 'y3539' | 'over';
  military: 'yes' | 'no';
  household: Household;
  income: IncomeBucket;
  myincome: 'none' | 'u50' | 'o50';
  housing: 'withParents' | 'soloRent' | 'soloOwn' | 'own';
  job: 'student' | 'working' | 'jobseeker' | 'etc';
}

export interface BenefitItem {
  id: string;
  name: string;
  category: string;
  status: 'eligible' | 'likely';
  amountLabel: string;
  annual: number; // 정렬용
  reasons: string[];
  cta: Cta;
  caveat?: string;
  source: string;
}

export interface Result {
  eligible: BenefitItem[];
  likely: BenefitItem[];
  related: RelatedCard[]; // mirae, kpass — 항상 포함
  ended: EndedProgram[]; // 종료 제도 — 항상 포함
}

type Band = 'under' | 'near' | 'over';
type AgeStatus = 'ok' | 'near' | 'no';

// 중위소득% 임계 경계 처리: 임계값 ±10%p 이내면 'near'(→ likely 강등, "정확한 소득 확인 필요").
function medianBand(pct: number, threshold: number): Band {
  if (pct <= threshold - 10) return 'under';
  if (pct <= threshold + 10) return 'near';
  return 'over';
}

// 만 19~34세(병역 시 최대 6년 연장) — 주택드림·월세.
function ageYouth1934(age: QuizAnswers['age'], military: QuizAnswers['military']): AgeStatus {
  if (age === 'y2024' || age === 'y2529' || age === 'y3034') return 'ok';
  if (age === 'y3539') return military === 'yes' ? 'near' : 'no';
  return 'no'; // u19(<19), over(40+)
}

// 만 15~34세(병역 시 최대 37세) — 국민취업.
function ageYouth1534(age: QuizAnswers['age'], military: QuizAnswers['military']): AgeStatus {
  if (age === 'u19' || age === 'y2024' || age === 'y2529' || age === 'y3034') return 'ok';
  if (age === 'y3539') return military === 'yes' ? 'near' : 'no';
  return 'no'; // over(40+)
}

const card = (id: string) => BENEFITS.find((b) => b.id === id)!;

function makeItem(id: string, status: BenefitItem['status'], reasons: string[]): BenefitItem {
  const c = card(id);
  return {
    id: c.id,
    name: c.name,
    category: c.category,
    status,
    amountLabel: c.amountLabel,
    annual: c.annual,
    reasons,
    cta: c.cta,
    caveat: c.caveat,
    source: c.source,
  };
}

export function recommend(a: QuizAnswers): Result {
  const median = MEDIAN_INCOME_2026[a.household];
  const pct = Math.round((INCOME_REP[a.income] / median) * 100);

  const eligible: BenefitItem[] = [];
  const likely: BenefitItem[] = [];
  const push = (it: BenefitItem) => (it.status === 'eligible' ? eligible : likely).push(it);

  // A1. 청년내일저축계좌 — 만 15~39세 & 가구 중위 50% 이하 & 본인 근로소득 월 10만원 이상.
  {
    const band = medianBand(pct, 50);
    if (a.age !== 'over' && band !== 'over' && a.myincome !== 'none') {
      const reasons = ['만 15~39세 청년이라 나이 조건을 충족해요'];
      reasons.push(
        band === 'under'
          ? `가구 소득이 중위 약 ${pct}%로 50% 이하 기준을 충족해요`
          : `가구 소득이 중위 약 ${pct}%로 기준선(50%)에 가까워 정확한 소득 확인이 필요해요`,
      );
      reasons.push(
        a.myincome === 'o50'
          ? '본인 근로·사업소득이 있어 월 10만원 저축 조건을 채울 수 있어요'
          : '본인 소득이 월 10만원 이상인지 확인되면 신청할 수 있어요',
      );
      const status = band === 'near' || a.myincome === 'u50' ? 'likely' : 'eligible';
      push(makeItem('niljeo', status, reasons));
    }
  }

  // A2. 국민취업지원제도 — 만 15~34세(병역 37) & 가구 중위 120% 이하 & 미취업 구직 & 가구 재산 5억 이하.
  //     재산은 진단 입력에 없어 확인 불가 → 항상 likely로 안내.
  {
    const ag = ageYouth1534(a.age, a.military);
    const band = medianBand(pct, 120);
    if (ag !== 'no' && band !== 'over' && a.job === 'jobseeker') {
      const reasons = [
        ag === 'ok'
          ? '만 15~34세 미취업 청년이라 나이 조건을 충족해요'
          : '병역 이행으로 연령 상한이 최대 37세까지 늘어나 대상이 될 수 있어요',
      ];
      reasons.push(
        band === 'under'
          ? `가구 소득이 중위 약 ${pct}%로 120% 이하 기준을 충족해요`
          : `가구 소득이 중위 약 ${pct}%로 기준선(120%)에 가까워 확인이 필요해요`,
      );
      reasons.push('미취업 구직 상태라 신청 대상이에요');
      reasons.push('가구 재산이 5억원 이하이면 신청할 수 있어요. 재산은 이 진단에서 확인하지 못해요');
      push(makeItem('chwiup', 'likely', reasons));
    }
  }

  // A3. 청년 주택드림 청약통장 — 만 19~34세(병역 6년) & 연소득 5천만 이하 & 무주택.
  //     가구 연소득이 5천만 이하면 개인은 확실히 그 이하(가구 합산 ≥ 개인) → 소득 조건 확정.
  {
    const ag = ageYouth1934(a.age, a.military);
    const incomeUnder = INCOME_REP[a.income] * 12 <= 50000000;
    const house: AgeStatus = a.housing === 'own' ? 'no' : a.housing === 'soloOwn' ? 'near' : 'ok';
    if (ag !== 'no' && house !== 'no') {
      const reasons = [
        ag === 'ok'
          ? '만 19~34세라 나이 조건을 충족해요'
          : '병역 이행으로 연령 상한이 최대 6년 늘어나 대상이 될 수 있어요',
      ];
      reasons.push(
        house === 'ok'
          ? '무주택자라 가입 조건을 충족해요'
          : '전세·월세면 무주택 조건에 맞아요. 자가 여부 확인이 필요해요',
      );
      reasons.push(
        incomeUnder
          ? '연소득 5,000만원 이하 조건을 충족해요'
          : '본인 연소득이 5,000만원 이하인지 확인이 필요해요',
      );
      reasons.push('2028년 12월 31일까지 우대금리 청약통장에 가입할 수 있어요');
      const status = ag === 'ok' && house === 'ok' && incomeUnder ? 'eligible' : 'likely';
      push(makeItem('jutaek', status, reasons));
    }
  }

  // A4. 청년월세 특별지원(2차) — 만 19~34세 & 별도거주 무주택 & 청년가구 중위 60% 이하.
  //     [R] 2026 신규 접수 미확정 → 자격을 충족해도 절대 eligible 아님(항상 likely).
  {
    const ag = ageYouth1934(a.age, a.military);
    const band = medianBand(pct, 60);
    const house: AgeStatus = a.housing === 'soloRent' ? 'ok' : a.housing === 'soloOwn' ? 'near' : 'no';
    if (ag !== 'no' && house !== 'no' && band !== 'over') {
      const reasons = [
        ag === 'ok'
          ? '만 19~34세라 나이 조건을 충족해요'
          : '병역 이행으로 연령 상한이 늘어나 대상이 될 수 있어요',
      ];
      reasons.push(
        house === 'ok'
          ? '부모와 따로 살면서 무주택이라 대상이 될 수 있어요'
          : '전세·월세로 별도 거주 중이면 대상이 될 수 있어요. 자가 여부 확인이 필요해요',
      );
      reasons.push(
        band === 'under'
          ? `청년가구 소득이 중위 약 ${pct}%로 60% 이하 기준에 들어와요`
          : `청년가구 소득이 중위 약 ${pct}%로 기준선(60%)에 가까워 확인이 필요해요`,
      );
      reasons.push('2026년 신규 접수 일정이 확정되지 않았어요. 마이홈포털에서 접수 여부를 확인하세요');
      push(makeItem('wolse', 'likely', reasons));
    }
  }

  // 지원 규모(대략 연 환산) desc 정렬.
  eligible.sort((x, y) => y.annual - x.annual);
  likely.sort((x, y) => y.annual - x.annual);

  return { eligible, likely, related: RELATED, ended: ENDED };
}
