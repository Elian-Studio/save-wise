// 청년미래적금 참여 14개 기관 — 단일 출처(Single Source of Truth)
// 출처(2026-06-24): 전국은행연합회 소비자포털 「청년미래적금금리」 비교공시 정본
//   (portal.kfb.or.kr/compare/receiving_youth_future_2.php, 은행별 상세 우대조건 원문).
//   은행 최종제공일 2026-05-28~06-22. 전 기관 14곳 항목별 %p·충족조건을 포털에서 직접 추출 → grade 'verified'.
// 공통: 기본금리 5.0%, 36개월, 비과세. 공통우대(소득플러스 0.5%p·청년재무상담 0.2%p)는 products.ts(MIRAE)에서 처리.

export type BankGroup = 2 | 3; // 3 → 기관우대 최대 3%p(최고 8%), 2 → 2%p(최고 7%)
export type BankGrade = 'verified' | 'press' | 'unknown'; // 🟢 정본 / 🟡 언론교차 / 🔴 미상

export interface Bank {
  id: string;
  name: string;
  grp: BankGroup;
  /** 급여(소득)이체 우대 %p(소수). null = 해당 항목 없음 */
  salaryPref: number | null;
  salaryCond: string;
  /** 카드/출금/생활 실적 우대 %p(소수). null = 해당 항목 없음 */
  cardPref: number | null;
  cardCond: string;
  /**
   * 도약계좌 연계가입/예적금미보유 자동충족 우대 %p(소수). 이 앱은 도약 보유자(갈아타기) 전용이므로
   * 전 사용자 자동 가산. null = 해당 항목 없음(가산 0). 조건 세부는 switchCond.
   */
  switchPref: number | null;
  switchCond: string;
  /** 출시/한시 우대 %p(소수). 가입기간 내 전원 자동. 기본 0 */
  launchBonus: number;
  /** 우대금리 묶음의 전제로 마케팅 동의가 필요한지 */
  marketingReq: boolean;
  grade: BankGrade;
}

// 모든 항목 %p·충족조건은 은행연합회 소비자포털 비교공시 원문 기준(2026-06-24 추출).
export const BANKS: Bank[] = [
  {
    id: 'ibk',
    name: 'IBK기업',
    grp: 3,
    salaryPref: 0.01,
    salaryCond: 'IBK 입출금 월50만↑ 급여 24개월↑',
    cardPref: 0.005,
    cardCond: 'IBK 신용/체크 월평균 30만↑',
    switchPref: 0.005,
    switchCond: 'IBK도약 연계가입 또는 최초고객(6개월 총수신 0원)',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'kb',
    name: 'KB국민',
    grp: 3,
    salaryPref: 0.01,
    salaryCond: 'KB 입출금 급여입금 12회↑',
    cardPref: 0.008,
    cardCond: '출금실적: 공과금 자동이체/리브모바일/KB카드 12회↑',
    switchPref: 0.005,
    switchCond: 'KB도약 가입이력 또는 6개월내 KB예적금 미보유',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'nh',
    name: 'NH농협',
    grp: 3,
    salaryPref: 0.01,
    salaryCond: 'NH 급여/가맹점대금 입금 18개월↑',
    cardPref: 0.007,
    cardCond: 'NH카드 월평균 20만↑',
    switchPref: 0.003,
    switchCond: '1년간 NH예적금 미보유 또는 도약 연계가입',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'shinhan',
    name: '신한',
    grp: 3,
    salaryPref: 0.003,
    salaryCond: '신한 급여 50만↑ 18개월↑',
    cardPref: 0.002,
    cardCond: '신한카드 18개월↑',
    switchPref: 0.003,
    switchCond: '6개월 예적금 미보유 또는 신한도약 연계가입',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'woori',
    name: '우리',
    grp: 3,
    salaryPref: 0.015,
    salaryCond: '우리 입출금 급여 100만↑ 18회↑',
    cardPref: 0.005,
    cardCond: '우리카드 결제/통신비·보험료 자동이체 18회↑',
    switchPref: 0.005,
    switchCond: '직전6개월 예적금 미보유 또는 도약(타행 포함) 보유 연계가입',
    launchBonus: 0.003,
    marketingReq: true,
    grade: 'verified',
  },
  {
    id: 'hana',
    name: '하나',
    grp: 3,
    salaryPref: 0.012,
    salaryCond: '하나 급여/가맹점대금 24회↑',
    cardPref: 0.006,
    cardCond: '하나카드 결제 24회↑',
    switchPref: 0.005,
    switchCond: '직전1년 예적금 미보유(도약·청약 등 제외 → 도약 보유해도 충족)',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'post',
    name: '우체국',
    grp: 3,
    salaryPref: 0.005,
    salaryCond: '우체국 급여실적(가입 전 급여이체 이력)',
    cardPref: 0.004,
    cardCond: '우체국 체크카드 20만↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음(첫거래 0.5%p는 도약 무관)',
    launchBonus: 0.01,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'im',
    name: 'iM뱅크',
    grp: 2,
    salaryPref: 0.003,
    salaryCond: 'iM 급여 50만↑ 24개월↑',
    cardPref: 0.003,
    cardCond: 'iM BC카드 월10만↑ 24개월↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음(최초거래 0.3%p는 신규고객·총수신0원 조건)',
    launchBonus: 0,
    marketingReq: true,
    grade: 'verified',
  },
  {
    id: 'busan',
    name: 'BNK부산',
    grp: 2,
    salaryPref: 0.005,
    salaryCond: '부산 급여이체 18개월↑',
    cardPref: 0.005,
    cardCond: '부산 신용/체크 누적 300만↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음(청약보유 0.3%p 별도)',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'gyeongnam',
    name: 'BNK경남',
    grp: 2,
    salaryPref: 0.007,
    salaryCond: '경남 급여/가맹점 50만↑',
    cardPref: 0.002,
    cardCond: '신용/체크 3개월 10만↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음(신규고객 0.2%p 별도)',
    launchBonus: 0.003,
    marketingReq: true,
    grade: 'verified',
  },
  {
    id: 'gwangju',
    name: '광주',
    grp: 2,
    salaryPref: 0.003,
    salaryCond: '광주 급여이체 30회↑',
    cardPref: null,
    cardCond: '카드 우대 없음(자동이체 0.2%p/정기예금 0.3%p 별도)',
    switchPref: 0.005,
    switchCond: '첫거래 또는 KJB도약 연계가입',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
  {
    id: 'jeonbuk',
    name: '전북',
    grp: 2,
    salaryPref: 0.005,
    salaryCond: '전북 급여/가맹점 50만↑ 계약기간 1/2↑',
    cardPref: 0.003,
    cardCond: 'JB카드 계약기간 1/2↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음',
    launchBonus: 0,
    marketingReq: true,
    grade: 'verified',
  },
  {
    id: 'suhyup',
    name: '수협',
    grp: 2,
    salaryPref: 0.005,
    salaryCond: '수협 급여 50만↑ 20개월↑',
    cardPref: 0.006,
    cardCond: '수협카드 월10만↑ 20개월↑',
    switchPref: null,
    switchCond: '도약연계 우대 없음',
    launchBonus: 0,
    marketingReq: true,
    grade: 'verified',
  },
  {
    id: 'kakao',
    name: '카카오뱅크',
    grp: 2,
    salaryPref: null,
    salaryCond: '급여 우대 없음',
    cardPref: 0.006,
    cardCond: '체크 24개월↑ 월30만↑(0.3%p)/월50만↑(0.6%p)',
    switchPref: null,
    switchCond: '도약연계 우대 없음(최초신규 0.7%p는 카뱅 신규 조건)',
    launchBonus: 0,
    marketingReq: false,
    grade: 'verified',
  },
];

/** 케이뱅크 미참여, 토스뱅크는 2026.12 별도 출시 예정 */
export const NON_PARTICIPATING_NOTE = '케이뱅크는 미참여, 토스뱅크는 2026.12 별도 출시 예정.';

export function getBank(id: string): Bank | undefined {
  return BANKS.find((b) => b.id === id);
}
