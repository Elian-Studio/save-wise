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
  benefit: Benefit; // 기본(base) 구간 혜택 = minPrevSpend 충족 시
  /** 전월실적 상위 구간의 상향 혜택. prevSpend가 t.minPrevSpend↑인 가장 높은 구간이 base를 대체(근거 있는 카드만). */
  tiers?: Array<{ minPrevSpend: number; benefit: Benefit }>;
  minPrevSpend: number; // 전월실적(원). 0=무실적
  annualFee: number; // 연회비(원). 0=무료
  source: string;
  grade: Grade;
  discontinued?: boolean;
  note?: string;
  applyUrl?: string; // 카드사 공식 상품 페이지(신청). 미확인 카드는 생략 → UI 버튼 미노출
}

// ── 정부 제도: K-패스 모두의카드 ──
// 실부담 = fare − max(정률환급, 일반형환급, 플러스형환급). 월 15회↑ 조건.
export const KPASS = {
  minRidesPerMonth: 15,
  rate: { general: 0.2, youth: 0.3, senior: 0.3, low: 0.533 } as Record<AgeTier, number>,
  // 월 환급 기준금액(수도권, 2026-04~09 한시 반값). 실부담 = min(fare, cap).
  // 확정: 국토부 대광위 반값표(korea.kr 148962910). youth·senior = "청년·2자녀·어르신" 티어, low = "3자녀↑·저소득".
  // [R] 지방(비수도권) 기준금액·반값종료(2026-10~) 정상값은 엔진 미저장(수도권 단일값) → docs/transit-cards-research.md 참조.
  capNormal: { general: 30000, youth: 25000, senior: 25000, low: 22000 } as Record<AgeTier, number>,
  capPlus: { general: 50000, youth: 45000, senior: 45000, low: 40000 } as Record<AgeTier, number>,
} as const;

// ── 대안: 기후동행카드(서울 정액·무제한) ──
// senior=62000: 어르신 전용 할인권종 없음(서울 할인권종 = 일반/청년/청소년/다자녀/저소득뿐, 65+는 지하철 무임 별도) → 일반요금 적용.
export const CLIMATE = {
  price: { general: 62000, youth: 55000, senior: 62000, low: 45000 } as Record<AgeTier, number>,
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
    applyUrl: 'https://www.tossbank.com/card/k-pass',
    note: '추가캐시백 한시 2026.04~09',
  },
  {
    id: 'kbank-one',
    issuer: '케이뱅크',
    name: 'ONE 체크',
    type: 'check',
    // 교통 추가 3천(교통 5만↑)은 전월실적 30만↑ 필요(교통비는 실적 제외). 무실적 '모두다 1%'는 교통 아님.
    benefit: { kind: 'flat', amount: 3000, minSpend: 50000 },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'kbanknow.com / kbanker.co.kr 223448',
    grade: 'verified',
    note: '교통 3천: 전월실적 30만↑ + 대중교통 5만↑ 조건(확인)',
  },
  {
    id: 'kakao-friends',
    issuer: '카카오뱅크',
    name: 'K-패스 프렌즈 체크',
    type: 'check',
    // 교통 4천은 전월실적 30만↑ + 대중교통 월 5만↑ 조건(공식). 무실적 0.2/0.4%는 교통 아님.
    benefit: { kind: 'flat', amount: 4000, minSpend: 50000 },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'kakaobank.com/Corp/News 16280',
    grade: 'verified',
  },
  {
    id: 'kb-check',
    issuer: 'KB국민',
    name: 'K-패스 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 2000 }, // 대중교통 10% 월 2,000점(=2천원) 한도(공식)
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'card.kbcard.com',
    grade: 'verified',
    applyUrl: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?mainCC=a&cooperationcode=09322',
  },
  {
    id: 'samsung-check',
    issuer: '삼성',
    name: 'K-패스 삼성체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 2000 }, // 대중교통 10%·연회비0 확인. 월 한도 2천·실적 20만은 추정[R]
    minPrevSpend: 200000,
    annualFee: 0,
    source: 'samsungcard.com(ABP1800)',
    grade: 'press',
    applyUrl: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=ABP1800',
    note: '공식: 대중교통 캐시백·연회비 없음. 월 한도·전월실적 수치 미공시[R]',
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
    // 대중교통 10% 월 3천 한도·전월 30만↑(엔진 보수값). 상위 실적(60만↑) 상향 한도는 공식 미확인 → 티어 미반영[R].
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 3000 },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'hanacard.co.kr',
    grade: 'press',
    applyUrl: 'https://www.hanacard.co.kr/OPI41000000D.web?CD_PD_SEQ=17033&_frame=no',
    note: '대중교통 10% 월 3천 한도(엔진 보수값). 60만↑ 상향 한도 공식 미확인[R]',
  },
  {
    id: 'im-check',
    issuer: 'iM(DGB)',
    name: 'iM K-패스 체크',
    type: 'check',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 2000 }, // 전월 20만↑ → 10% 월 2천 한도(공식)
    minPrevSpend: 200000,
    annualFee: 0,
    source: 'imbank.co.kr',
    grade: 'verified',
  },
  {
    id: 'nh-check',
    issuer: 'NH농협',
    name: 'K-패스 체크',
    type: 'check',
    // 대중교통 10% + 모빌리티 통합 월 한도: 20~80만 3천, 80만↑ 5천. 교통비도 전월실적에 포함.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 3000 },
    tiers: [{ minPrevSpend: 800000, benefit: { kind: 'pct', pct: 0.1, monthlyCap: 5000 } }],
    minPrevSpend: 200000,
    annualFee: 0,
    source: 'card.nonghyup.com',
    grade: 'verified',
    applyUrl: 'https://card.nonghyup.com/servlet/IpCc2021R.act?CD_WRS_SQNO=90010470',
    note: '80만↑ 월 5천 한도, 교통비 실적포함',
  },
  {
    id: 'ibk-check',
    issuer: 'IBK기업',
    name: 'K-패스 체크',
    type: 'check',
    // 대중교통 1회당 100원 할인, 월 최대 1천원(월 10회). 실적 30만. flat 1천 근사.
    benefit: { kind: 'flat', amount: 1000, minSpend: 0 },
    minPrevSpend: 300000,
    annualFee: 0,
    source: 'cardapplication.ibk.co.kr',
    grade: 'verified',
    applyUrl: 'https://m.bccard.com/app/mobileweb/CardDetail.do?exec=cardDetail&cardGdsNo=103109',
    note: '1회 100원·월 최대 1천(월 10회) → flat 근사',
  },
  // 신용
  {
    id: 'shinhan-credit',
    issuer: '신한',
    name: 'K-패스 신한카드',
    type: 'credit',
    // 대중교통 10%, 전월 30~60만 월 7천 / 60만↑ 월 1.5만 한도. 교통비 실적포함.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 7000 },
    tiers: [{ minPrevSpend: 600000, benefit: { kind: 'pct', pct: 0.1, monthlyCap: 15000 } }],
    minPrevSpend: 300000,
    annualFee: 10000,
    source: 'shinhancard.com',
    grade: 'verified',
    applyUrl: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1225543_2207.html',
    note: '60만↑ 월 1.5만 한도',
  },
  {
    id: 'kb-credit',
    issuer: 'KB국민',
    name: 'KB국민 K-패스',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 2000 }, // 대중교통 10% 월 2천 한도, 전월 30만↑(공식)
    minPrevSpend: 300000,
    annualFee: 8000,
    source: 'card.kbcard.com',
    grade: 'verified',
    applyUrl: 'https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=09321&mainCC=a',
  },
  {
    id: 'timoney-shinhan',
    issuer: '신한',
    name: '티머니 Pay&GO 신한카드',
    type: 'credit',
    // 대중교통 30% 할인, 전월 30~50만 월 7천 / 50~100만 1.2만 / 100만↑ 1.8만. 모바일티머니 앱 등록 필요.
    benefit: { kind: 'pct', pct: 0.3, monthlyCap: 7000 },
    tiers: [
      { minPrevSpend: 500000, benefit: { kind: 'pct', pct: 0.3, monthlyCap: 12000 } },
      { minPrevSpend: 1000000, benefit: { kind: 'pct', pct: 0.3, monthlyCap: 18000 } },
    ],
    minPrevSpend: 300000,
    annualFee: 15000,
    source: 'shinhancard.com',
    grade: 'verified',
    applyUrl: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1216792_2207.html',
    note: '모바일티머니 앱 등록 필요(아이폰 제외) · 50만↑ 1.2만/100만↑ 1.8만',
  },
  {
    id: 'samsung-credit',
    issuer: '삼성',
    name: 'K-패스 삼성카드',
    type: 'credit',
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 10000 }, // 대중교통 10%, 실적 따라 최대 1만(공식)
    minPrevSpend: 400000,
    annualFee: 10000,
    source: 'samsungcard.com',
    grade: 'verified',
    applyUrl: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1830',
  },
  {
    id: 'woori-credit',
    issuer: '우리',
    name: '우리 K-패스',
    type: 'credit',
    // 대중교통 10% 청구할인, 건당 5만까지·횟수 무제한(월 총한도 명시 없음). 실적 30만.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: null },
    minPrevSpend: 300000,
    annualFee: 13000,
    source: 'm.wooricard.com',
    grade: 'verified',
    note: '건당 5만·횟수 무제한',
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
    applyUrl: 'https://card.nonghyup.com/servlet/IpCc2021R.act?CD_WRS_SQNO=90010471',
  },
  {
    id: 'hana-credit',
    issuer: '하나',
    name: 'K-패스 하나 신용',
    type: 'credit',
    // 대중교통 10% 청구할인, 월 1만(전월 50만↑)/2만(100만↑). 실적 50만.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 10000 },
    tiers: [{ minPrevSpend: 1000000, benefit: { kind: 'pct', pct: 0.1, monthlyCap: 20000 } }],
    minPrevSpend: 500000,
    annualFee: 10000,
    source: 'hanacard.co.kr',
    grade: 'verified',
    applyUrl: 'https://www.hanacard.co.kr/OPI41000000D.web?schID=pcd&mID=PI41017016P&CD_PD_SEQ=17016',
    note: '100만↑ 월 2만 한도',
  },
  {
    id: 'ibk-credit',
    issuer: 'IBK기업',
    name: 'K-패스 신용',
    type: 'credit',
    // 확인: 300원/회·1일3회·월 1만 한도·전월실적 20만↑·연회비 2천(BC). flat 3천은 보수적 근사.
    benefit: { kind: 'flat', amount: 3000, minSpend: 0 },
    minPrevSpend: 200000,
    annualFee: 2000,
    source: 'banksalad CARD004320 / card-gorilla 4035',
    grade: 'verified',
    applyUrl: 'https://m.bccard.com/app/mobileweb/CardDetail.do?exec=cardDetail&cardGdsNo=103105',
    note: '300원/회·1일3회·월 1만 한도 → flat 3천 근사(엔진 단순화)',
  },
  {
    id: 'hyundai-zwork',
    issuer: '현대',
    name: '현대카드 Z work Edition2',
    type: 'credit',
    // 대중교통 10% 청구할인, 월 6천(전월 50만↑)/1만(100만↑). 실적 50만.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 6000 },
    tiers: [{ minPrevSpend: 1000000, benefit: { kind: 'pct', pct: 0.1, monthlyCap: 10000 } }],
    minPrevSpend: 500000,
    annualFee: 10000,
    source: 'hyundaicard.com',
    grade: 'verified',
    note: '100만↑ 월 1만 한도',
  },
  {
    id: 'lotte-enloca',
    issuer: '롯데',
    name: 'K-패스엔로카',
    type: 'credit',
    // 전월 40만↑ 대중교통 10% 월 1만 / 80만↑ 15% 월 1.5만. 기본 구간(40만)은 10%.
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 10000 },
    tiers: [{ minPrevSpend: 800000, benefit: { kind: 'pct', pct: 0.15, monthlyCap: 15000 } }],
    minPrevSpend: 400000,
    annualFee: 20000,
    source: 'lottecard.co.kr',
    grade: 'verified',
    applyUrl: 'https://www.lottecard.co.kr/app/LPCDXBA_V100.lc?vtCdKndC=P15644-A15644',
    note: '80만↑ 15% 월 1.5만',
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
    applyUrl: 'https://m.bccard.com/app/mobileweb/CardDetail.do?exec=cardDetail&cardGdsNo=103112',
  },
  {
    id: 'kjbank-green',
    issuer: '광주은행',
    name: 'K-그린카드 V2',
    type: 'credit',
    // 확인: 전월 30만↑ 대중교통 10% 에코머니 적립. 월 한도 미공시 → 보수적 5천[R].
    benefit: { kind: 'pct', pct: 0.1, monthlyCap: 5000 },
    minPrevSpend: 300000,
    annualFee: 10000,
    source: 'kjbank.com / wealthywing',
    grade: 'press',
    applyUrl: 'https://www.kjbank.com/ib20/mnu/FPMCARD020103?ib20_wc=FPMCARD050102V10:FPMCARD050102V20&INBN_GDS_NO=CDR20230623001',
    note: '대중교통 10%·전월30만↑ 확인, 월 한도만 미공시[R]',
  },
];
