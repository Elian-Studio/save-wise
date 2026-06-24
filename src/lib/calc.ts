// 청년도약계좌 ↔ 청년미래적금 갈아타기 계산 엔진 (순수 함수, 프레임워크 무관)
// 정본: docs/calc-spec.md. 모든 이자는 단리 적금식·비과세 가정.
// 단위: 금액=원, salary=만원, rate=소수.

import { BANKS, getBank, type Bank, type BankGrade } from '../data/banks';
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
  pref: number; // 적용 우대 합계(소수, groupMax로 캡)
  tier: string;
  groupMax: number;
  grade: BankGrade; // 데이터 신뢰등급 (UI 노출용)
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

// 내 거래현황 → 은행 적용금리.
// 이 앱은 도약 보유자(갈아타기) 전용 → switchPref·launchBonus는 전 사용자 자동 가산.
// 항목별 %p는 은행연합회 소비자포털 정본(banks.ts). 총 우대는 기관 상한(groupMax)으로 캡.
export function bankRate(bank: Bank, I: Inputs): BankRateResult {
  const base = MIRAE.baseRate;
  const groupMax = bank.grp === 3 ? 0.03 : 0.02;
  const isMain = I.payBank === bank.id || I.mainBank === bank.id;
  let pref = 0;
  const parts: string[] = [];

  // 갈아타기 자동충족 (도약 연계가입/예적금미보유) + 출시·한시 우대
  if (bank.switchPref != null) {
    pref += bank.switchPref;
    parts.push('도약연계');
  }
  if (bank.launchBonus > 0) {
    pref += bank.launchBonus;
    parts.push('출시');
  }

  // 거래현황 기반: 급여이체 / 카드·출금실적
  if (isMain && bank.salaryPref != null) {
    pref += bank.salaryPref;
    parts.push('급여이체');
  }
  if (bank.cardPref != null && ((I.cardCo === bank.id && I.cardSpend) || (isMain && I.autoTransfer))) {
    pref += bank.cardPref;
    parts.push('카드');
  }

  // 공통우대 (전 기관 동일, MIRAE 상수)
  if (I.salary <= MIRAE.lowIncomeThreshold) {
    pref += MIRAE.lowIncomeBonus;
    parts.push('저소득');
  }
  if (I.advisory) {
    pref += MIRAE.advisoryBonus;
    parts.push('재무상담');
  }

  pref = Math.min(pref, groupMax); // 공통우대 포함 기관 상한으로 캡
  const tier = parts.length ? parts.join('+') + ' 우대' : '기본금리만';
  return { r: base + pref, pref, tier, groupMax, grade: bank.grade };
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
  const k = Math.min(I.paidCount, I.elapsed, LEAP.termMonths); // 납입 횟수는 경과 개월을 넘을 수 없음(환급금 과대계상 방지)
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

/** 추천 결정을 이루는 개별 판단 요인 — "왜 A vs B"를 표로 보여주기 위한 구조 */
export interface DecisionFactor {
  /** 요인명 (예: '정부기여금 유형') */
  label: string;
  /** 이 요인이 가리키는 방향 */
  favors: 'switch' | 'stay' | 'neutral';
  /** 점수 기여 절대값(0이면 결정에 영향 없음) */
  weight: number;
  /** 유지(도약) 관점 값/설명 */
  stayText: string;
  /** 전환(미래) 관점 값/설명 */
  switchText: string;
  /** 이 요인이 favors 쪽을 가리키는 구체 사유 */
  why: string;
}

export interface Recommendation {
  verdict: 'switch' | 'stay' | 'close';
  main: string;
  reasons: string[];
  /** 결론에 이른 요인별 근거 — 비교 테이블용. score = Σ(switch:+weight / stay:-weight / neutral:0) */
  factors: DecisionFactor[];
  score: number;
}

// 추천 가중치·임계값 — 튜닝 단일 출처. 값 의미는 docs/calc-spec.md 참조.
// score = Σ(아래 가중치) → score≥switchAt:전환 / score≤stayAt:유지 / 그 외:접전
export const RECOMMEND = {
  prefBonus: 2, // 우대형(12%) 자격
  diffBonus: 1.2, // 같은 돈 3년, 미래적금 우위
  diffPenalty: 1.2, // 같은 돈 3년, 도약 우위
  highIncomeBonus: 1.2, // 총급여 > contribCap → 도약 기여금 0
  rateBonus: 0.6, // 미래 적용금리 ≥ 도약 + rateGap
  rateGap: 0.01,
  nearGenPenalty: 2.5, // 잔여 ≤ nearGenMonths & 일반형
  nearGenMonths: 6,
  nearPenalty: 1.5, // 잔여 ≤ nearMonths
  nearMonths: 12,
  longBonus: 0.5, // 잔여 ≥ longMonths
  longMonths: 42,
  liquidBonus: 0.4, // 유동성 선호 목적
  switchAt: 1.0, // score ≥ → 전환
  stayAt: -1.0, // score ≤ → 유지
} as const;

export function recommend(I: Inputs, C: ComputeResult): Recommendation {
  const W = RECOMMEND;
  const leapC = fmtMoney(C.leapContrib);
  const miraeC = fmtMoney(miraeContribMonthly(I.miraeMonthly, I.type));
  const factors: DecisionFactor[] = [];

  // F1. 정부기여금 유형 (우대형 12% vs 일반형 6%)
  factors.push(
    I.type === 'pref'
      ? {
          label: '정부기여금 유형',
          favors: 'switch',
          weight: W.prefBonus,
          stayText: `도약 월 ${leapC}`,
          switchText: `미래 우대형 12% · 월 ${miraeC}`,
          why: '우대형(12%)은 일반형의 2배 — 전환의 가장 강력한 이유',
        }
      : {
          label: '정부기여금 유형',
          favors: 'neutral',
          weight: 0,
          stayText: `도약 월 ${leapC}`,
          switchText: `미래 일반형 6% · 월 ${miraeC}`,
          why: '양쪽 표준 매칭 — 이 요인만으로는 결정적이지 않음',
        },
  );

  // F2. 같은 돈을 3년 넣을 때 순이익 (공정 비교)
  factors.push(
    C.diff3yr > 0
      ? {
          label: '같은 돈 3년 순이익',
          favors: 'switch',
          weight: W.diffBonus,
          stayText: fmtMoney(C.leap36.benefit),
          switchText: fmtMoney(C.mirae36.benefit),
          why: `미래적금이 약 ${fmtMoney(C.diff3yr)} 더 이득(기여금+이자)`,
        }
      : {
          label: '같은 돈 3년 순이익',
          favors: 'stay',
          weight: W.diffPenalty,
          stayText: fmtMoney(C.leap36.benefit),
          switchText: fmtMoney(C.mirae36.benefit),
          why: `도약이 약 ${fmtMoney(-C.diff3yr)} 더 이득 — 유지가 유리`,
        },
  );

  // F3. 내 소득구간 — 도약 정부기여금 유무
  factors.push(
    I.salary > INCOME.contribCap
      ? {
          label: '내 소득구간 기여금',
          favors: 'switch',
          weight: W.highIncomeBonus,
          stayText: '0원 (6,000만 초과·비과세만)',
          switchText: `미래 월 ${miraeC}`,
          why: `총급여 ${INCOME.contribCap.toLocaleString()}만원 초과 → 도약 기여금이 0이라 전환 이점이 큼`,
        }
      : {
          label: '내 소득구간 기여금',
          favors: 'neutral',
          weight: 0,
          stayText: `도약 월 ${leapC} 수령 중`,
          switchText: `미래 월 ${miraeC}`,
          why: '도약 기여금이 살아있어 이 요인은 결정적이지 않음',
        },
  );

  // F4. 적용금리 (내 거래현황 기준)
  factors.push(
    C.rMirae >= I.leapRate + W.rateGap
      ? {
          label: '적용금리',
          favors: 'switch',
          weight: W.rateBonus,
          stayText: `도약 ${pct(I.leapRate)}`,
          switchText: `미래 ${pct(C.rMirae)} (${C.bank.name})`,
          why: '내 거래현황 기준 미래적금 금리가 더 높음',
        }
      : {
          label: '적용금리',
          favors: 'neutral',
          weight: 0,
          stayText: `도약 ${pct(I.leapRate)}`,
          switchText: `미래 ${pct(C.rMirae)}`,
          why: '금리 차이가 전환을 정당화할 정도는 아님',
        },
  );

  // F5. 도약 만기까지 잔여기간
  if (C.remaining <= W.nearGenMonths && I.type === 'gen') {
    factors.push({
      label: '도약 만기까지',
      favors: 'stay',
      weight: W.nearGenPenalty,
      stayText: `잔여 ${C.remaining}개월 (임박)`,
      switchText: '새로 3년 약정 시작',
      why: '코앞 만기 + 일반형 → 전환 실익이 작아 만기수령(유지)을 권장',
    });
  } else if (C.remaining <= W.nearMonths) {
    factors.push({
      label: '도약 만기까지',
      favors: 'stay',
      weight: W.nearPenalty,
      stayText: `잔여 ${C.remaining}개월 (임박)`,
      switchText: '새로 3년 약정',
      why: '만기 임박 — 마무리 단계 (우대형·큰 금리차면 전환 실익은 남음)',
    });
  } else if (C.remaining >= W.longMonths) {
    factors.push({
      label: '도약 만기까지',
      favors: 'switch',
      weight: W.longBonus,
      stayText: `잔여 ${C.remaining}개월 (장기 묶임)`,
      switchText: '3년 만기로 단축',
      why: '잔여가 길어 5년 묶임 부담이 큼 — 3년 만기 전환이 매력적',
    });
  } else {
    factors.push({
      label: '도약 만기까지',
      favors: 'neutral',
      weight: 0,
      stayText: `잔여 ${C.remaining}개월`,
      switchText: '3년 만기',
      why: '중간 구간 — 잔여기간만으로는 결정적이지 않음',
    });
  }

  // F6. 저축 목적 (목돈 최대화 vs 유동성)
  factors.push(
    I.goal === 'liquid'
      ? {
          label: '저축 목적',
          favors: 'switch',
          weight: W.liquidBonus,
          stayText: '5년 만기',
          switchText: '3년 만기 (유동성↑)',
          why: '유동성 선호 → 만기가 5년→3년으로 짧아지는 전환이 목적에 부합',
        }
      : {
          label: '저축 목적',
          favors: 'neutral',
          weight: 0,
          stayText: '5년 장기 적립',
          switchText: '3년 만기',
          why: '목돈 최대화 목적 — 만기 길이는 중립',
        },
  );

  const score = factors.reduce(
    (s, f) => s + (f.favors === 'switch' ? f.weight : f.favors === 'stay' ? -f.weight : 0),
    0,
  );
  const reasons = factors.filter((f) => f.favors !== 'neutral').map((f) => f.why);

  let verdict: Recommendation['verdict'];
  let main: string;
  if (score >= W.switchAt) {
    verdict = 'switch';
    main = '청년미래적금으로 전환을 권장';
  } else if (score <= W.stayAt) {
    verdict = 'stay';
    main = '청년도약계좌 유지를 권장';
  } else {
    verdict = 'close';
    main = '접전 — 우선순위(목돈 vs 유동성)로 결정';
  }
  return { verdict, main, reasons: reasons.slice(0, 4), factors, score };
}
