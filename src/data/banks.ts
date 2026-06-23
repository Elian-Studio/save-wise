// 청년미래적금 참여 14개 기관 — 단일 출처(Single Source of Truth)
// 출처: 금융위 87005(은행별 금리), 은행연합회 소비자포털, 카드고릴라 4278.
// 기준일: 2026-06-23. 갱신 시 이 파일만 수정 후 재배포.

export type BankGroup = 2 | 3; // 3 → 기관우대 최대 3%p(최고 8%), 2 → 2%p(최고 7%)

export interface Bank {
  id: string;
  name: string;
  grp: BankGroup;
  /** 카드 우대금리(소수). null = 공시 미확인 (카드고릴라 기준 5개 은행만 확정) */
  cardPref: number | null;
  /** 카드 우대 충족 조건 설명 */
  cardCond: string;
}

export const BANKS: Bank[] = [
  { id: 'ibk', name: 'IBK기업', grp: 3, cardPref: 0.005, cardCond: '카드 만기까지 월평균 30만원↑' },
  { id: 'nh', name: 'NH농협', grp: 3, cardPref: 0.007, cardCond: '카드 만기 전전월말까지 월평균 20만원↑' },
  { id: 'shinhan', name: '신한', grp: 3, cardPref: 0.002, cardCond: '가입기간 중 18개월↑ 신한카드 사용' },
  { id: 'woori', name: '우리', grp: 3, cardPref: 0.005, cardCond: '만기 전전월말까지 우리카드 사용' },
  { id: 'hana', name: '하나', grp: 3, cardPref: 0.006, cardCond: '하나카드 결제 24회차↑' },
  { id: 'kb', name: 'KB국민', grp: 3, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'post', name: '우체국', grp: 3, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'im', name: 'iM뱅크', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'busan', name: 'BNK부산', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'gyeongnam', name: 'BNK경남', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'gwangju', name: '광주', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'jeonbuk', name: '전북', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'suhyup', name: '수협', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
  { id: 'kakao', name: '카카오뱅크', grp: 2, cardPref: null, cardCond: '카드 우대조건 공시 미확인' },
];

/** 케이뱅크 미참여, 토스뱅크는 2026.12 별도 출시 예정 */
export const NON_PARTICIPATING_NOTE = '케이뱅크는 미참여, 토스뱅크는 2026.12 별도 출시 예정.';

export function getBank(id: string): Bank | undefined {
  return BANKS.find((b) => b.id === id);
}
