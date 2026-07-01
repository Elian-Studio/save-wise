// 교통카드(K-패스/모두의카드) 단일 출처. 기준 2026-07.
// 정본·근거: docs/transit-cards-research.md, docs/transit-card-spec.md.
// 교통 추가혜택 = K-패스 정부환급과 별개인 카드사 자체 혜택(전월실적 충족 가정).
// [R] 주석 = 미확정값(공식 확인/월변동). grade=press 항목은 UI에서 신뢰도 노출.

export const DATA_AS_OF = '2026-07';

export type CardType = 'credit' | 'check';
export type Grade = 'verified' | 'press';
export type AgeTier = 'general' | 'youth' | 'senior' | 'low';

/** 카드 추가혜택: 정률(pct, 월 한도) 또는 정액(월 교통 minSpend↑ 시 flat 캐시백) */
export type Benefit =
  | { kind: 'pct'; pct: number; monthlyCap: number | null } // 대중교통 pct%, 월 한도(원, null=명시없음)
  | { kind: 'flat'; amount: number; minSpend: number }; // 월 교통 minSpend원↑ 시 amount원

export interface TransitCard {
  id: string;
  issuer: string; // 카드사
  name: string;
  type: CardType;
  benefit: Benefit;
  minPrevSpend: number; // 전월실적(원). 0=무실적
  annualFee: number; // 연회비(원). 0=무료
  source: string;
  grade: Grade;
  discontinued?: boolean;
  note?: string;
}

// ── 정부 제도: K-패스 모두의카드 ──
// 실부담 = fare − max(정률환급, 일반형환급, 플러스형환급). 월 15회↑ 조건.
export const KPASS = {
  minRidesPerMonth: 15,
  rate: { general: 0.2, youth: 0.3, senior: 0.3, low: 0.533 } as Record<AgeTier, number>,
  // 월 환급 기준금액(수도권, 2026-04~09 한시 반값). 실부담 = min(fare, cap).
  // [R] 지방(비수도권)·반값종료(2026-10~)·youth/senior/low 플러스형 정확값 → molit 공식표 확정 대상.
  capNormal: { general: 30000, youth: 20000, senior: 20000, low: 20000 } as Record<AgeTier, number>,
  capPlus: { general: 50000, youth: 40000 /*[R]*/, senior: 40000 /*[R]*/, low: 40000 /*[R]*/ } as Record<
    AgeTier,
    number
  >,
} as const;

// ── 대안: 기후동행카드(서울 정액·무제한) ── senior 정확값 [R]
export const CLIMATE = {
  price: { general: 62000, youth: 55000, senior: 62000 /*[R]*/, low: 45000 } as Record<AgeTier, number>,
  bikeAdd: 3000, // 따릉이 포함권 추가
} as const;

// ── 발급 카드 전수(교통 추가혜택) ──
export const TRANSIT_CARDS: TransitCard[] = [
  // 체크
  {
    id: 'toss-check',
    issuer: '토스뱅크',
    name: 'K-패스 체크',
    type: 'check',
    benefit: { kind: 'flat', amount: 2000, minSpend: 40000 },
    minPrevSpend: 0,
    annualFee: 0,
    source: 'tossbank.com/card/k-pass',
    grade: 'verified',
    note: '추가캐시백 한시 2026.04~09',
  },
  {
    id: 'kbank-one',
    issuer: '케이뱅크',
    name: 'ONE 체크',
    type: 'check',
    benefit: { kind: 'flat', amount: 3000, minSpend: 50000 },
    minPrevSpend: 0,
    annualFee: 0,
    source: 'kbanknow.com',
    grade: 'verified',
  },
  {
    id: 'kakao-friends',
    issuer: '카카오뱅크',
    name: 'K-패스 프렌즈 체크',
    type: 'check',
    benefit: { kind: 'flat', amount: 4000, minSpend: 0 },
    minPrevSpend: 0,
    annualFee: 0,
    source: 'kakaobank 16280',
    grade: 'press',
    note: '월 15회↑ 조건(공식 재확인), 기본 0.2/0.4% 별도',
  },
  {
    id: 'kb-check',
    issuer: 'KB국민',
    name: 'K-패스 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null }, // 10% 적립(월 2천점≈2만원)
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'card.kbcard.com',
    grade: 'verified',
  },
  {
    id: 'samsung-check',
    issuer: '삼성',
    name: 'K-패스 삼성체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 0,
    source: '블로그(공식 재확인)',
    grade: 'press',
  },
  {
    id: 'woori-cookie',
    issuer: '우리',
    name: '우리 K-패스 체크(COOKIE)',
    type: 'check',
    benefit: { kind: 'flat', amount: 3000, minSpend: 0 },
    minPrevSpend: 200000,
    annualFee: 0,
    source: 'wooricard',
    grade: 'verified',
    discontinued: true,
    note: '신규발급 중단',
  },
  {
    id: 'hana-check',
    issuer: '하나',
    name: 'K-패스 하나 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 3000 }, // 전월 60만↑ 월6천 한도[R]
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'hanacard.co.kr',
    grade: 'verified',
  },
  {
    id: 'im-check',
    issuer: 'iM(DGB)',
    name: 'iM K-패스 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 200000,
    annualFee: 0,
    source: 'imbank',
    grade: 'verified',
  },
  {
    id: 'nh-check',
    issuer: 'NH농협',
    name: 'K-패스 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'banksalad(공식 재확인)',
    grade: 'press',
  },
  {
    id: 'ibk-check',
    issuer: 'IBK기업',
    name: 'K-패스 체크',
    type: 'check',
    // 대중교통 1회당 100원(정률 아님). fare 기반 근사 불가 → 보수적 flat[R].
    benefit: { kind: 'flat', amount: 1500, minSpend: 0 },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'bccard',
    grade: 'press',
    note: '1회 100원 정액 → flat 근사[R]',
  },
  // 신용
  {
    id: 'shinhan-credit',
    issuer: '신한',
    name: 'K-패스 신한카드',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 10000,
    source: 'shinhancard.com',
    grade: 'verified',
  },
  {
    id: 'kb-credit',
    issuer: 'KB국민',
    name: 'KB국민 K-패스',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 8000,
    source: 'card.kbcard.com',
    grade: 'verified',
  },
  {
    id: 'samsung-credit',
    issuer: '삼성',
    name: 'K-패스 삼성카드',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 400000,
    annualFee: 10000,
    source: 'samsungcard.com',
    grade: 'verified',
  },
  {
    id: 'woori-credit',
    issuer: '우리',
    name: '우리 K-패스',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 13000,
    source: 'banksalad(공식 재확인)',
    grade: 'press',
  },
  {
    id: 'nh-credit',
    issuer: 'NH농협',
    name: 'NH K-패스',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 10000 },
    minPrevSpend: 400000,
    annualFee: 13000,
    source: 'nhcardblog',
    grade: 'verified',
  },
  {
    id: 'hana-credit',
    issuer: '하나',
    name: 'K-패스 하나 신용',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 10000,
    source: 'hanacard.co.kr(공식 재확인)',
    grade: 'press',
  },
  {
    id: 'ibk-credit',
    issuer: 'IBK기업',
    name: 'K-패스 신용',
    type: 'credit',
    // 대중교통 최대 300원/회 → flat 근사[R]
    benefit: { kind: 'flat', amount: 3000, minSpend: 0 },
    minPrevSpend: 200000,
    annualFee: 2000,
    source: 'card-gorilla 4035',
    grade: 'press',
    note: '1회 최대 300원 정액 → flat 근사[R]',
  },
  {
    id: 'hyundai-zwork',
    issuer: '현대',
    name: '현대카드 Z work Edition2',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 500000,
    annualFee: 10000,
    source: 'hyundaicard.com',
    grade: 'verified',
  },
  {
    id: 'lotte-enloca',
    issuer: '롯데',
    name: 'K-패스엔로카',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.15, monthlyCap: null }, // 10~15% 구간
    minPrevSpend: 400000,
    annualFee: 20000,
    source: 'lottecard',
    grade: 'verified',
  },
  {
    id: 'bc-baro',
    issuer: 'BC바로',
    name: 'BC바로 K-패스',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.15, monthlyCap: 30000 }, // 한도 전월100만↑ 월3만
    minPrevSpend: 300000,
    annualFee: 6000,
    source: 'bccard.com',
    grade: 'verified',
  },
  {
    id: 'kjbank-green',
    issuer: '광주은행',
    name: 'K-패스그린 V2',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.05, monthlyCap: null }, // 에코머니 적립
    minPrevSpend: 300000,
    annualFee: 10000,
    source: 'kjbank',
    grade: 'verified',
  },
];
