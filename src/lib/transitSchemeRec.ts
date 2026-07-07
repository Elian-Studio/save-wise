// 패스픽 추천 엔진 — 순수 함수(SSR 결정적). 근거: passpick 디자인 CARDS/recommend 포팅.
// 자격(eligible) → 월 환급/절감액(benefit) → score 순으로 교통 제도를 추천한다.
// K-패스 계열(kpass/gyeonggi/incheon)은 비율 환급과 기준금액 초과분 환급 중 유리한 쪽 자동 적용
// (경기도 공지 gg.go.kr, 2026-01-01 시행).
import type { SchemeId } from '../data/transitSchemes';
import { KPASS, type AgeTier } from '../data/transitCards';

export interface QuizAnswers {
  region: 'seoul' | 'gg' | 'ic' | 'etc';
  age: 'u19' | 'y' | 'y39' | 'mid' | 'sr';
  trips: 'few' | 'mid' | 'many' | 'lots';
  mode: 'metro' | 'wide' | 'gtx' | 'mix';
  bike: 'often' | 'some' | 'no';
}

export interface SchemeRecItem {
  id: SchemeId;
  score: number;
  benefit: number; // 월 예상 절감/환급액(원)
  eligible: boolean; // 자격 충족 여부(정렬 1순위). K-패스 계열은 월 15회 미만이면 false.
  reasons: string[];
  savings: string;
  note: string;
}

export interface SchemeRecResult {
  list: SchemeRecItem[];
  spend: number; // 월 예상 교통비(원)
  tripN: number; // 월 예상 승차 횟수
}

const fmt = (n: number): string => n.toLocaleString('ko-KR');
const manwon = (won: number): string => `${won / 10000}만원`; // 25000→'2.5만원', 30000→'3만원'

// K-패스 계열 환급: 비율 환급과 기준금액 초과분 환급 중 더 유리한 쪽을 자동 선택.
export function kpassRefund(
  spend: number,
  tier: AgeTier,
  wide: boolean,
): { refund: number; threshold: number; excessWins: boolean } {
  const rate = KPASS.rate[tier];
  const threshold = wide ? KPASS.capPlus[tier] : KPASS.capNormal[tier];
  const byRate = Math.round(spend * rate);
  const byExcess = spend - threshold;
  return { refund: Math.max(byRate, byExcess, 0), threshold, excessWins: byExcess > byRate };
}

export function recommend(a: QuizAnswers): SchemeRecResult {
  const tripN = { few: 10, mid: 28, many: 50, lots: 64 }[a.trips] ?? 30;
  const spend = tripN * 1550;
  const youth39 = a.age === 'y' || a.age === 'y39';
  const adult = a.age !== 'u19';
  const wideMode = a.mode === 'wide' || a.mode === 'gtx';
  const kpassEligible = a.trips !== 'few'; // 월 15회 미만이면 계열 환급 조건 미달
  const out: SchemeRecItem[] = [];

  // 기후동행카드 — 서울 전용
  if (a.region === 'seoul') {
    const saving = spend - 62000;
    let score = saving > 0 ? 90 : 58;
    if (wideMode) score -= 30;
    if (a.bike === 'often') score += 4;
    if (a.trips === 'lots') score += 4;
    const reasons = ['서울 안에서 주로 다니니까 서울 전용 무제한 정기권이 딱이야'];
    if (saving > 0) reasons.push(`지금 예상 교통비(약 ${fmt(spend)}원)보다 정기권이 ${fmt(saving)}원 싸`);
    else reasons.push('교통비가 월 62,000원에서 멈춰서 마음 편히 탈 수 있어');
    if (a.bike === 'often') reasons.push('따릉이 자주 타면 65,000원권으로 자전거까지 무제한이야');
    if (youth39) reasons.push('19~39세 청년이라 월 7,000원 더 환급받아');
    out.push({
      id: 'climate',
      score,
      benefit: Math.max(saving, 0),
      eligible: true,
      reasons,
      savings: saving > 0 ? `한 달에 약 ${fmt(saving)}원 아껴` : '무제한이라 마음 편히 타',
      note: wideMode ? '신분당선·광역버스엔 적용이 안 돼서 아쉬워' : '서울 밖으로 자주 나가면 애매해져',
    });
  }

  // K-패스 — 전국. tier: 청년(y)→youth, 어르신(sr)→senior, 그 외 general.
  if (adult) {
    const tier: AgeTier = a.age === 'y' ? 'youth' : a.age === 'sr' ? 'senior' : 'general';
    const { refund, threshold, excessWins } = kpassRefund(spend, tier, wideMode);
    let score = a.trips === 'few' ? 34 : 76;
    if (a.region === 'etc') score += 14;
    if (wideMode) score += 6;
    const reasons: string[] = [];
    if (a.trips !== 'few') reasons.push(`월 ${tripN}번쯤 타니까 환급 조건(15번 이상)은 여유롭게 충족`);
    if (tier === 'youth') reasons.push('19~34세 청년이라 환급률이 30%로 올라가');
    else if (tier === 'senior') reasons.push('65세 이상 어르신이라 환급률이 30%야');
    else reasons.push('쓴 교통비의 20%를 매달 그대로 돌려받아');
    if (excessWins) reasons.push(`기준금액(${manwon(threshold)}) 넘는 금액은 전부 돌려받는 방식이 자동 적용돼`);
    if (a.region === 'etc') reasons.push('수도권 밖에서도 쓸 수 있는 건 사실상 K-패스뿐이야');
    if (wideMode) reasons.push('광역버스·GTX 요금까지 전부 환급 대상이야');
    out.push({
      id: 'kpass',
      score,
      benefit: refund,
      eligible: kpassEligible,
      reasons,
      savings: `한 달에 약 ${fmt(refund)}원 돌려받아`,
      note: a.trips === 'few' ? '월 15번 이상 타야 환급이 시작돼' : '어디 살든 쓸 수 있는 만능형이야',
    });
  }

  // The 경기패스. tier: 청년(y/y39)→youth(39세까지), 어르신(sr)→senior, 그 외 general.
  if (a.region === 'gg' && adult) {
    const tier: AgeTier = youth39 ? 'youth' : a.age === 'sr' ? 'senior' : 'general';
    const { refund, threshold, excessWins } = kpassRefund(spend, tier, wideMode);
    const score = a.trips === 'few' ? 38 : 88;
    const reasons = ['경기도민 전용으로 업그레이드된 K-패스야'];
    reasons.push('환급 횟수 제한이 없어서 많이 탈수록 이득이야');
    if (youth39) reasons.push('경기패스는 39세까지 청년(30% 환급)으로 쳐줘');
    if (excessWins) reasons.push(`기준금액(${manwon(threshold)}) 넘는 금액은 전부 돌려받는 방식이 자동 적용돼`);
    if (wideMode) reasons.push('서울 오가는 광역버스·GTX 요금도 환급돼');
    out.push({
      id: 'gyeonggi',
      score,
      benefit: refund,
      eligible: kpassEligible,
      reasons,
      savings: `한 달에 약 ${fmt(refund)}원 돌려받아`,
      note: a.trips === 'few' ? '월 15번 이상 타야 환급이 시작돼' : '경기도민이면 K-패스보다 무조건 나아',
    });
  }

  // 인천 I-패스. tier: 청년(y/y39)→youth(39세까지), 어르신(sr)→senior, 그 외 general.
  if (a.region === 'ic' && adult) {
    const tier: AgeTier = youth39 ? 'youth' : a.age === 'sr' ? 'senior' : 'general';
    const { refund, threshold, excessWins } = kpassRefund(spend, tier, wideMode);
    const score = a.trips === 'few' ? 38 : 88;
    const reasons = ['인천시민 전용으로 업그레이드된 K-패스야'];
    reasons.push('환급 횟수 제한이 없어서 많이 탈수록 이득이야');
    if (a.age === 'sr') reasons.push('65세 이상은 환급률이 30%로 더 높아');
    if (youth39) reasons.push('I-패스는 39세까지 청년(30% 환급)으로 쳐줘');
    if (excessWins) reasons.push(`기준금액(${manwon(threshold)}) 넘는 금액은 전부 돌려받는 방식이 자동 적용돼`);
    if (wideMode) reasons.push('서울 오가는 광역버스·GTX 요금도 환급돼');
    out.push({
      id: 'incheon',
      score,
      benefit: refund,
      eligible: kpassEligible,
      reasons,
      savings: `한 달에 약 ${fmt(refund)}원 돌려받아`,
      note: a.trips === 'few' ? '월 15번 이상 타야 환급이 시작돼' : '인천시민이면 K-패스보다 무조건 나아',
    });
  }

  // 후불 교통카드 — 전 지역·전 연령
  {
    const score = a.trips === 'few' ? 93 : 46;
    const reasons: string[] = [];
    if (a.trips === 'few') {
      reasons.push(`한 달 ${tripN}번 정도면 환급 카드 조건(15번)을 채우기 빠듯해`);
      reasons.push('조건 없이 그냥 찍고 타는 게 제일 속 편해');
    } else {
      reasons.push('충전이나 조건 없이 쓰기엔 제일 간단해');
    }
    reasons.push('전월 실적 채우면 교통비 5~15% 할인도 챙길 수 있어');
    out.push({
      id: 'postpaid',
      score,
      benefit: Math.round(spend * 0.1),
      eligible: true,
      reasons,
      savings: '실적 채우면 교통비 최대 15% 할인',
      note: a.trips === 'few' ? '가끔 타는 사람한텐 이게 정답이야' : '많이 타는 사람한텐 아끼는 폭이 작아',
    });
  }

  // 자격 충족(eligible) → 월 환급/절감액(benefit) → score 순.
  out.sort((x, y) => {
    if (x.eligible !== y.eligible) return x.eligible ? -1 : 1;
    if (y.benefit !== x.benefit) return y.benefit - x.benefit;
    return y.score - x.score;
  });
  return { list: out, spend, tripN };
}
