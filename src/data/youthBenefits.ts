// 청년 지원금 통합 자격진단 단일 출처. 정본: docs/youth-benefits-spec.md (2026-07-09, deep-research 검증).
// 정직성 규칙: 출처 없는 수치 금지. [R](미확정)은 카드에 caveat로 "확인 필요" 표기, eligible 단정 금지.
import type { QuizAnswers } from '../lib/youthBenefitRec';
import type { QuizQuestion } from '../components/quiz/Quiz';

// 가구원 수. 6인 이상은 '6plus'로 6인 값 사용(스펙 §2).
export type Household = '1' | '2' | '3' | '4' | '5' | '6plus';

// 2026년 기준 중위소득 100% 월액(원). 출처: 보건복지부 2026 고시(mohw.go.kr list_no=1487098).
export const MEDIAN_INCOME_2026: Record<Household, number> = {
  '1': 2564238,
  '2': 4199292,
  '3': 5359036,
  '4': 6494738,
  '5': 7556719,
  '6plus': 8555952,
};

// 가구 세전 월소득 버킷. rep = 중위소득% 산출용 대표값(버킷 중앙값, 개방구간은 대표치).
export type IncomeBucket = 'u150' | 'b150' | 'b250' | 'b400' | 'b600' | 'o800';
export const INCOME_REP: Record<IncomeBucket, number> = {
  u150: 1000000,
  b150: 2000000,
  b250: 3250000,
  b400: 5000000,
  b600: 7000000,
  o800: 9000000,
};

export type Cta = { kind: 'apply'; url: string } | { kind: 'internal'; to: string };

// 자격 판정 대상 카드.
export interface BenefitCard {
  id: string;
  name: string;
  category: string;
  summary: string;
  amountLabel: string; // 검증된 지원 규모 문구
  annual: number; // 정렬용 대략 연 환산 지원액(원)
  cta: Cta;
  caveat?: string;
  source: string;
}

// 내부 서비스로 연결되는 참고 카드(자격 판정 대상 아님). kpass는 미검증이라 수치 금지 — 요약·링크만.
export interface RelatedCard {
  id: string;
  name: string;
  category: string;
  summary: string;
  cta: Cta;
}

export interface EndedProgram {
  id: string;
  name: string;
  note: string;
}

export const BENEFITS: BenefitCard[] = [
  {
    id: 'niljeo',
    name: '청년내일저축계좌',
    category: '자산형성',
    summary: '본인이 월 10만원을 저축하면 정부가 월 30만원을 더 얹어줘 3년 만기에 목돈을 만드는 자산형성 통장이야.',
    amountLabel: '정부 매칭 월 30만원 · 3년 최대 1,080만원',
    annual: 3600000,
    cta: { kind: 'apply', url: 'https://hope.welfareinfo.or.kr' },
    source: '복지로 자산형성포털 hope.welfareinfo.or.kr/bsns/bsnsIntrcnAcc.do',
  },
  {
    id: 'chwiup',
    name: '국민취업지원제도 (청년 I유형)',
    category: '취업',
    summary: '미취업 청년에게 구직촉진수당 월 60만원을 6개월간 주고 취업 지원 서비스를 함께 제공하는 제도야.',
    amountLabel: '구직촉진수당 월 60만원 × 6개월 (+부양가족 최대 40만원)',
    annual: 3600000,
    cta: { kind: 'apply', url: 'https://www.work24.go.kr' },
    source: 'work24 systId=SI00000316, 정부24',
  },
  {
    id: 'jutaek',
    name: '청년 주택드림 청약통장',
    category: '주거/자산',
    summary: '우대금리 청약통장에 청년 주택드림 대출까지 연계되는, 내 집 마련을 준비하는 청년용 통장이야.',
    amountLabel: '우대금리 청약통장 + 청년 주택드림 대출 연계',
    annual: 500000,
    cta: { kind: 'apply', url: 'https://nhuf.molit.go.kr' },
    source: '주택도시기금 nhuf.molit.go.kr/FP/FP07/FP0701/FP07010301.jsp',
  },
  {
    id: 'wolse',
    name: '청년월세 특별지원(2차)',
    category: '주거',
    summary: '부모와 따로 사는 무주택 청년에게 월세를 월 최대 20만원씩 최대 12개월 지원해주는 제도야.',
    amountLabel: '월 최대 20만원 × 12개월',
    annual: 2400000,
    caveat: '2026년 신규 접수 일정은 마이홈포털에서 확인하세요.',
    cta: { kind: 'apply', url: 'https://www.myhome.go.kr' },
    source: '국토부 사업매뉴얼, 정부24 161300000099',
  },
];

// 내부 서비스로 잇는 참고 카드. mirae→적금 계산기, kpass→교통카드 진단(수치 미표기).
export const RELATED: RelatedCard[] = [
  {
    id: 'mirae',
    name: '청년미래적금',
    category: '자산형성',
    summary: '청년도약계좌 후속 적금이야. 3년 만기·월 최대 50만원·정부기여 6~12%. 예상 수령액을 계산해봐.',
    cta: { kind: 'internal', to: '/youth-savings' },
  },
  {
    id: 'kpass',
    name: 'K-패스 청년',
    category: '교통',
    summary: '대중교통을 자주 탄다면 교통비 환급 카드도 함께 살펴봐. 어떤 카드가 맞는지 빠르게 진단해줄게.',
    cta: { kind: 'internal', to: '/' },
  },
];

// 종료된 제도(신규 불가). 정직 표기 — 수치 없이 "끝남"만 안내.
export const ENDED: EndedProgram[] = [
  {
    id: 'doyak',
    name: '청년도약계좌',
    note: '2025년 12월 신규 가입이 종료됐어요. 기존 보유자는 청년미래적금 갈아타기를 확인하세요.',
  },
  {
    id: 'naechae',
    name: '청년내일채움공제',
    note: '2024년 일몰되어 신규 가입이 불가능해요.',
  },
  {
    id: 'jaejik',
    name: '청년재직자 내일채움공제(플러스)',
    note: '2022·2023년 일몰되어 신규 가입이 불가능해요.',
  },
];

// 퀴즈 질문 7문항. option v는 QuizAnswers 해당 키와 일치(공용 QuizQuestion 제네릭으로 강제).
export const QUIZ_QUESTIONS: QuizQuestion<QuizAnswers>[] = [
  {
    id: 'age',
    title: '나이가 어떻게 돼?',
    hint: '만 나이 기준이야. 제도마다 청년 기준이 달라서 물어봐.',
    options: [
      { v: 'u19', label: '18세 이하' },
      { v: 'y2024', label: '19~24세' },
      { v: 'y2529', label: '25~29세' },
      { v: 'y3034', label: '30~34세' },
      { v: 'y3539', label: '35~39세' },
      { v: 'over', label: '40세 이상' },
    ],
  },
  {
    id: 'military',
    title: '병역을 이행했어?',
    hint: '병역을 마치면 일부 지원금은 나이 상한이 늘어나.',
    options: [
      { v: 'yes', label: '했어 / 하는 중' },
      { v: 'no', label: '아니야 / 해당 없음' },
    ],
  },
  {
    id: 'household',
    title: '함께 사는 가족은 몇 명이야?',
    hint: '주민등록상 같이 사는 가족 수(본인 포함). 소득 기준을 계산하는 데 써.',
    options: [
      { v: '1', label: '1인' },
      { v: '2', label: '2인' },
      { v: '3', label: '3인' },
      { v: '4', label: '4인' },
      { v: '5', label: '5인' },
      { v: '6plus', label: '6인 이상' },
    ],
  },
  {
    id: 'income',
    title: '가구 월소득은 얼마 정도야?',
    hint: '세금 떼기 전, 함께 사는 가족 전체의 월 소득 합계야. 혼자 살면 본인 소득만.',
    options: [
      { v: 'u150', label: '150만원 미만' },
      { v: 'b150', label: '150만~250만원' },
      { v: 'b250', label: '250만~400만원' },
      { v: 'b400', label: '400만~600만원' },
      { v: 'b600', label: '600만~800만원' },
      { v: 'o800', label: '800만원 이상' },
    ],
  },
  {
    id: 'myincome',
    title: '본인이 직접 버는 소득이 있어?',
    hint: '아르바이트 포함 본인 근로·사업소득 기준이야.',
    options: [
      { v: 'none', label: '없어' },
      { v: 'u50', label: '월 50만원 미만' },
      { v: 'o50', label: '월 50만원 이상' },
    ],
  },
  {
    id: 'housing',
    title: '지금 어떻게 살고 있어?',
    options: [
      { v: 'withParents', label: '부모님과 같이 살아' },
      { v: 'soloRent', label: '따로 살아 (월세)' },
      { v: 'soloOwn', label: '따로 살아 (전세·자가)' },
      { v: 'own', label: '내 집이 있어' },
    ],
  },
  {
    id: 'job',
    title: '요즘 어떤 상태야?',
    hint: '마지막 질문이야!',
    options: [
      { v: 'student', label: '학생' },
      { v: 'working', label: '직장에 다녀' },
      { v: 'jobseeker', label: '구직 중 (미취업)' },
      { v: 'etc', label: '그 외' },
    ],
  },
];
