// 상품 파라미터 — 단일 출처. 기준일 2026-06-23.
// 출처: 금융위 86767/87005/87106/87158, korea.kr 정책브리핑, FSC 83782(도약 기여금 확대),
//       은행연합회 소비자포털, 토스뱅크 상품설명.

export const DATA_AS_OF = '2026-06-24';

/** 단위 규약: 금액=원, 소득(salary)=만원, 금리(rate)=소수 */
export const MAN = 10000;

// ── 청년도약계좌 (현재 보유) ──
export const LEAP = {
  termMonths: 60,
  maxMonthlyMan: 70,
} as const;

/**
 * 도약계좌 정부기여금 (2025.1 확대): 매칭한도 전구간 월 70만으로 통일,
 * 기존 매칭한도 초과분에는 3.0% 적용.
 * 월 기여금 = min(m, baseLimit)*baseRate + max(0, min(m,70)-baseLimit)*excessRate
 * 단위: 만원/월. 소득초과(6000~7500)=0(비과세만), 7500초과=가입불가.
 */
export const LEAP_CONTRIB_TIERS: Array<{ maxIncome: number; baseLimit: number; baseRate: number }> = [
  { maxIncome: 2400, baseLimit: 40, baseRate: 0.06 },
  { maxIncome: 3600, baseLimit: 50, baseRate: 0.046 },
  { maxIncome: 4800, baseLimit: 60, baseRate: 0.037 },
  { maxIncome: 6000, baseLimit: 70, baseRate: 0.03 },
];
export const LEAP_EXCESS_RATE = 0.03;

// ── 청년미래적금 (전환 대상) ──
export const MIRAE = {
  termMonths: 36,
  maxMonthlyMan: 50,
  baseRate: 0.05, // 기본금리 5% 고정 (전 기관 동일)
  contribGen: 0.06, // 일반형 정부기여금률 (월 납입액 대비)
  contribPref: 0.12, // 우대형
  // 공통 우대
  lowIncomeBonus: 0.005, // 총급여 3,600만 이하 +0.5%p
  lowIncomeThreshold: 3600,
  advisoryBonus: 0.002, // 청년 재무상담 이수 +0.2%p
} as const;

// ── 소득구간(가입/기여금) 경계 ──
export const INCOME = {
  contribCap: 6000, // 초과 시 도약 기여금 0
  joinCap: 7500, // 초과 시 미래적금 가입 불가
} as const;

// ── 일정 (2026 최초 가입기간) ──
export const SCHEDULE = {
  applyStart: '2026-06-22',
  applyEnd: '2026-07-03',
  reviewStart: '2026-07-06',
  reviewEnd: '2026-07-24',
  openStart: '2026-07-27',
  openEnd: '2026-08-07',
} as const;

export const SOURCES: Array<{ label: string; url: string }> = [
  { label: '금융위 87005 (은행별 금리)', url: 'https://www.fsc.go.kr/no010101/87005' },
  { label: '금융위 87106 (갈아타기)', url: 'https://www.fsc.go.kr/no010101/87106' },
  { label: '금융위 86767', url: 'https://www.fsc.go.kr/no010101/86767' },
  { label: '금융위 83782 (도약 기여금 확대)', url: 'https://www.fsc.go.kr/edu/news/83782' },
  { label: '은행연합회 소비자포털', url: 'https://portal.kfb.or.kr/compare/receiving_youth_future_2.php' },
  { label: '카드고릴라 (은행별 카드 우대)', url: 'https://www.card-gorilla.com/contents/detail/4278' },
  { label: '서민금융진흥원 청년미래적금', url: 'https://www.kinfa.or.kr/financialProduct/youthFutureSavings.do' },
];
