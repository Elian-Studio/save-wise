// 청년도약계좌 ↔ 청년미래적금 갈아타기 계산 엔진 (순수 함수, 프레임워크 무관)
// 정본: docs/calc-spec.md. 모든 이자는 단리 적금식·비과세 가정.
// 단위: 금액=원, salary=만원, rate=소수.

import { BANKS, getBank, type Bank } from '../data/banks';
import { LEAP, LEAP_CONTRIB_TIERS, LEAP_EXCESS_RATE, MIRAE, INCOME, MAN } from '../data/products';
import { fmtMoney, pct } from './format';

export type Goal = 'amount' | 'liquid';
export type MiraeType = 'gen' | 'pref';
export type BankMode = 'auto' | 'manual';

export interface Inputs {
  salary: number; // 만원
  goal: Goal;
  elapsed: number; // 도약 경과 개월 0..60
  paidCount: number; // 도약 실제 납입 횟수 0..60
  leapMonthly: number; // 원
  leapRate: number; // 소수
  miraeMonthly: number; // 원
  type: MiraeType;
  payBank: string; // 월급(급여이체) 은행 id | '' | 'etc'(미참여)
  mainBank: string; // 주거래 은행 id | '' | 'etc'(미참여)
  cardCo: string; // 주 사용 카드사 id | ''
  cardSpend: boolean;
  autoTransfer: boolean;
  advisory: boolean;
  bankMode: BankMode; // 'auto' = 최적 은행 자동, 'manual' = 사용자 지정
  manualBank: string; // bankMode==='manual'일 때 은행 id
  investReturn: number; // 가정 투자 연수익률(소수) — 투자 비교용
}

export interface ProductResult {
  principal: number;
  contrib: number;
  interest: number;
  benefit: number; // 순이익(기여금+이자)
  total: number;
  eff: number; // 연 실질효과율(단리환산)
  n: number;
}

export interface BankRateResult {
  r: number;
  inst: number; // 기관 우대분
  common: number; // 공통 우대분
  tier: string;
  groupMax: number;
}
export interface BestBank extends BankRateResult {
  bank: Bank;
}

// 단리 적금 이자: 월 정액 m(원), n개월, 연리 r(소수)
export function simpleInterest(m: number, n: number, r: number): number {
  return (m * r * (n * (n + 1))) / 2 / 12;
}

// 청년도약계좌 월 정부기여금(원). 2025.1 확대 구조(2단 매칭).
export function leapContribMonthly(incomeMan: number, monthlyWon: number): number {
  const m = monthlyWon / MAN; // 만원
  const tier = LEAP_CONTRIB_TIERS.find((t) => incomeMan <= t.maxIncome);
  if (!tier) return 0; // 6,000만 초과 → 비과세만
  const c =
    Math.min(m, tier.baseLimit) * tier.baseRate +
    Math.max(0, Math.min(m, LEAP.maxMonthlyMan) - tier.baseLimit) * LEAP_EXCESS_RATE;
  return c * MAN;
}

// 청년미래적금 월 정부기여금(원)
export function miraeContribMonthly(monthlyWon: number, type: MiraeType): number {
  return monthlyWon * (type === 'pref' ? MIRAE.contribPref : MIRAE.contribGen);
}

// 내 거래현황 → 은행 적용금리
export function bankRate(bank: Bank, I: Inputs): BankRateResult {
  const base = MIRAE.baseRate;
  const groupMax = bank.grp === 3 ? 0.03 : 0.02;
  // 월급(급여이체) 은행 또는 주거래 은행이 이 은행이면 주거래 우대 대상
  const isMain = I.payBank === bank.id || I.mainBank === bank.id;
  let inst = 0;
  let tier = '기본금리만';
  if (isMain && I.autoTransfer) {
    inst = groupMax;
    tier = '주거래 최대우대';
  } else if (I.cardCo === bank.id && I.cardSpend && bank.cardPref != null) {
    inst = bank.cardPref;
    tier = '카드 우대';
  } else if (isMain) {
    inst = 0;
    tier = '급여이체(자동이체 필요)';
  }
  inst = Math.min(inst, groupMax);
  let common = 0;
  if (I.salary <= MIRAE.lowIncomeThreshold) common += MIRAE.lowIncomeBonus;
  if (I.advisory) common += MIRAE.advisoryBonus;
  return { r: base + inst + common, inst, common, tier, groupMax };
}

export function bestBank(I: Inputs): BestBank {
  let best: BestBank | null = null;
  for (const b of BANKS) {
    const x = bankRate(b, I);
    if (!best || x.r > best.r) best = { bank: b, ...x };
  }
  return best as BestBank;
}

export function product(monthlyWon: number, n: number, r: number, contribMonthlyWon: number): ProductResult {
  const principal = monthlyWon * n;
  const contrib = contribMonthlyWon * n;
  const interest = simpleInterest(monthlyWon, n, r) + simpleInterest(contribMonthlyWon, n, r);
  const benefit = contrib + interest;
  const total = principal + benefit;
  const avgYears = (n + 1) / 2 / 12;
  const eff = principal > 0 ? benefit / (principal * avgYears) : 0;
  return { principal, contrib, interest, benefit, total, eff, n };
}

export interface ComputeResult {
  bb: BestBank;
  bank: Bank;
  rMirae: number;
  stay: ProductResult;
  mirae: ProductResult;
  refund: ProductResult;
  leap36: ProductResult;
  mirae36: ProductResult;
  diff3yr: number;
  remaining: number;
  leapContrib: number;
  k: number;
  nStay: number;
  totalPaid: number;
}

export function compute(I: Inputs): ComputeResult {
  const auto = bestBank(I);
  let bb: BestBank;
  if (I.bankMode === 'manual' && I.manualBank) {
    const bank = getBank(I.manualBank) ?? auto.bank;
    bb = { bank, ...bankRate(bank, I) };
  } else {
    bb = auto;
  }
  const bank = bb.bank;
  const rMirae = bb.r;

  const leapContrib = leapContribMonthly(I.salary, I.leapMonthly);
  const remaining = LEAP.termMonths - I.elapsed;
  const k = Math.min(I.paidCount, LEAP.termMonths);
  const nStay = Math.min(k + remaining, LEAP.termMonths);

  const stay = product(I.leapMonthly, nStay, I.leapRate, leapContrib);
  const refund = product(I.leapMonthly, k, I.leapRate, leapContrib);

  const miraeContrib = miraeContribMonthly(I.miraeMonthly, I.type);
  const mirae = product(I.miraeMonthly, MIRAE.termMonths, rMirae, miraeContrib);

  const X = I.miraeMonthly;
  const leap36 = product(X, MIRAE.termMonths, I.leapRate, leapContribMonthly(I.salary, X));
  const mirae36 = product(X, MIRAE.termMonths, rMirae, miraeContribMonthly(X, I.type));
  const diff3yr = mirae36.benefit - leap36.benefit;

  return {
    bb,
    bank,
    rMirae,
    stay,
    mirae,
    refund,
    leap36,
    mirae36,
    diff3yr,
    remaining,
    leapContrib,
    k,
    nStay,
    totalPaid: I.leapMonthly * k,
  };
}

export interface Recommendation {
  verdict: 'switch' | 'stay' | 'close';
  main: string;
  reasons: string[];
  score: number;
}

export function recommend(I: Inputs, C: ComputeResult): Recommendation {
  const reasons: string[] = [];
  let score = 0;
  if (I.type === 'pref') {
    score += 2;
    reasons.push('우대형(12%) 자격 → 정부기여금이 일반형의 2배. 전환의 가장 강력한 이유.');
  }
  if (C.diff3yr > 0) {
    score += 1.2;
    reasons.push(`같은 돈을 3년 넣을 때 미래적금이 도약 대비 약 ${fmtMoney(C.diff3yr)} 더 이득(기여금+이자).`);
  } else {
    score -= 1.2;
    reasons.push(`같은 돈 3년 기준 도약이 약 ${fmtMoney(-C.diff3yr)} 더 이득 — 유지가 유리.`);
  }
  if (I.salary > INCOME.contribCap) {
    score += 1.2;
    reasons.push('총급여 6,000만원 초과 → 도약은 정부기여금 0(비과세만). 미래적금 기여금이 큰 이점.');
  }
  if (C.rMirae >= I.leapRate + 0.01) {
    score += 0.6;
    reasons.push(
      `내 거래현황 기준 미래적금 적용금리 ${pct(C.rMirae)}(${C.bank.name}) ≥ 현재 도약 금리 ${pct(I.leapRate)}.`,
    );
  }
  if (C.remaining <= 6 && I.type === 'gen') {
    // 코앞 만기 + 일반형: 전환 실익이 작아 마무리(유지) 쪽으로 강하게
    score -= 2.5;
    reasons.push(
      `도약 만기까지 ${C.remaining}개월 + 일반형 — 전환은 새로 3년 약정 시작이라 실익이 작음. 유지 후 만기 수령을 권장.`,
    );
  } else if (C.remaining <= 12) {
    // 만기 임박이지만 우대형·금리차가 크면 전환 실익이 남아 과하게 깎지 않음
    score -= 1.5;
    reasons.push(
      `도약 만기까지 ${C.remaining}개월 — 거의 마무리 단계. (우대형이거나 미래적금 금리차가 크면 전환 실익은 남음)`,
    );
  } else if (C.remaining >= 42) {
    score += 0.5;
    reasons.push(`도약 잔여 ${C.remaining}개월로 길어 5년 묶임 부담이 큼 — 3년 만기 전환 매력.`);
  }
  if (I.goal === 'liquid') {
    score += 0.4;
    reasons.push('유동성 선호 → 만기가 5년→3년으로 짧아지는 전환이 목적에 부합.');
  }

  let verdict: Recommendation['verdict'];
  let main: string;
  if (score >= 1.0) {
    verdict = 'switch';
    main = '청년미래적금으로 전환을 권장';
  } else if (score <= -1.0) {
    verdict = 'stay';
    main = '청년도약계좌 유지를 권장';
  } else {
    verdict = 'close';
    main = '접전 — 우선순위(목돈 vs 유동성)로 결정';
  }
  return { verdict, main, reasons: reasons.slice(0, 4), score };
}
