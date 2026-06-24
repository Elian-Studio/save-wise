// 투자 대비 관점 — "청미적을 할까, 투자를 할까?"
// 적금은 확정 수익, 투자는 '가정·비보장' 기대수익. UI에서 위험 경고 필수.

/** 적립식 월복리 미래가치 (월말 적립 가정). monthlyWon×n 납입, 연수익률 annualReturn(소수) */
export function investFutureValue(monthlyWon: number, n: number, annualReturn: number): number {
  const r = annualReturn / 12;
  if (r === 0) return monthlyWon * n;
  return monthlyWon * ((Math.pow(1 + r, n) - 1) / r);
}

/** 투자 기대 순이익 = 미래가치 − 납입원금 */
export function investGain(monthlyWon: number, n: number, annualReturn: number): number {
  return investFutureValue(monthlyWon, n, annualReturn) - monthlyWon * n;
}

/**
 * 같은 월납입·기간에서 미래적금 순이익(targetBenefit)을 따라잡는 break-even 연수익률.
 * 투자 순이익은 수익률에 단조증가하므로 이분탐색으로 해를 구한다. 0~200% 범위.
 */
export function breakEvenReturn(monthlyWon: number, n: number, targetBenefit: number): number {
  if (monthlyWon <= 0 || n <= 0) return 0;
  let lo = 0;
  let hi = 2.0;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (investGain(monthlyWon, n, mid) < targetBenefit) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
