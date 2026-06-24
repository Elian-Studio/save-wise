// 청년미래적금 참여 14개 기관 — 단일 출처(Single Source of Truth)
// 출처(2026-06-24 deep-research): 금융위 87005(그룹·상한, 1차), 은행연합회 소비자포털,
//   각 은행 공식 상품설명서, 디지털투데이/파이낸셜뉴스(항목별 %p 종합), 카드고릴라.
// ⚠️ 그룹·상한(최고 8%/7%)은 금융위 1차 확정. 항목별 %p(급여이체·카드)는 언론·공시 종합값으로
//    가입 전 각 은행에서 재확인 필요. 미확인 항목은 null.

export type BankGroup = 2 | 3; // 3 → 기관우대 최대 3%p(최고 8%), 2 → 2%p(최고 7%)

export interface Bank {
  id: string;
  name: string;
  grp: BankGroup;
  /** 카드(신용/체크) 실적 우대 %p(소수). null = 카드 우대 항목 없음/미확인 */
  cardPref: number | null;
  /** 카드 우대 충족 조건 설명 */
  cardCond: string;
  /** 급여(소득)이체 우대 %p(소수). null = 미확인 */
  salaryPref: number | null;
}

// 그룹/상한: 금융위 87005(1차). 일부 언론이 우리·신한을 2%p로 표기했으나 정부 공시는 3%p.
// 항목별 %p: 디지털투데이·파이낸셜뉴스·각 은행 상품설명서 종합. 충족조건(금액·횟수·기간)은 은행별 상이.
export const BANKS: Bank[] = [
  {
    id: 'ibk',
    name: 'IBK기업',
    grp: 3,
    cardPref: 0.005,
    cardCond: '카드 월평균 30만원↑ (※주택청약 우대와 출처 상충)',
    salaryPref: 0.01,
  },
  { id: 'nh', name: 'NH농협', grp: 3, cardPref: 0.007, cardCond: 'NH카드 월평균 20만원↑', salaryPref: 0.01 },
  { id: 'shinhan', name: '신한', grp: 3, cardPref: 0.002, cardCond: '신한카드 18개월↑ 사용', salaryPref: 0.003 },
  { id: 'woori', name: '우리', grp: 3, cardPref: 0.005, cardCond: '우리카드 사용', salaryPref: 0.015 },
  { id: 'hana', name: '하나', grp: 3, cardPref: 0.006, cardCond: '하나카드 결제 24회차↑', salaryPref: 0.012 },
  {
    id: 'kb',
    name: 'KB국민',
    grp: 3,
    cardPref: 0.008,
    cardCond: 'KB카드 결제/공과금·자동이체 12회↑',
    salaryPref: 0.01,
  },
  { id: 'post', name: '우체국', grp: 3, cardPref: 0.004, cardCond: '체크카드 실적', salaryPref: null },
  { id: 'im', name: 'iM뱅크', grp: 2, cardPref: 0.003, cardCond: '카드 이용실적', salaryPref: 0.003 },
  { id: 'busan', name: 'BNK부산', grp: 2, cardPref: 0.005, cardCond: '카드 결제실적', salaryPref: 0.005 },
  { id: 'gyeongnam', name: 'BNK경남', grp: 2, cardPref: 0.002, cardCond: '카드 결제실적', salaryPref: 0.007 },
  { id: 'gwangju', name: '광주', grp: 2, cardPref: null, cardCond: '별도 카드 우대 항목 없음', salaryPref: 0.005 },
  { id: 'jeonbuk', name: '전북', grp: 2, cardPref: 0.003, cardCond: '카드 결제실적', salaryPref: 0.005 },
  { id: 'suhyup', name: '수협', grp: 2, cardPref: 0.006, cardCond: '카드 결제실적', salaryPref: 0.005 },
  {
    id: 'kakao',
    name: '카카오뱅크',
    grp: 2,
    cardPref: 0.006,
    cardCond: '체크카드 월 50만원↑(월30만↑ 0.3%p)',
    salaryPref: null,
  },
];

/** 케이뱅크 미참여, 토스뱅크는 2026.12 별도 출시 예정 */
export const NON_PARTICIPATING_NOTE = '케이뱅크는 미참여, 토스뱅크는 2026.12 별도 출시 예정.';

export function getBank(id: string): Bank | undefined {
  return BANKS.find((b) => b.id === id);
}
