import { describe, it, expect } from 'vitest';
import { investFutureValue, investGain, breakEvenReturn } from './invest';
import { MAN } from '../data/products';

describe('투자 대비 계산', () => {
  it('수익률 0% → 미래가치=원금', () => {
    expect(investFutureValue(50 * MAN, 36, 0)).toBe(50 * MAN * 36);
    expect(investGain(50 * MAN, 36, 0)).toBe(0);
  });

  it('수익률이 오르면 기대 순이익도 증가(단조)', () => {
    const g5 = investGain(50 * MAN, 36, 0.05);
    const g10 = investGain(50 * MAN, 36, 0.1);
    expect(g10).toBeGreaterThan(g5);
    expect(g5).toBeGreaterThan(0);
  });

  it('break-even 수익률에서 투자 순이익 ≈ 목표 순이익', () => {
    const target = 4_640_000; // 예: 미래적금 순이익 약 464만
    const be = breakEvenReturn(50 * MAN, 36, target);
    expect(be).toBeGreaterThan(0);
    expect(be).toBeLessThan(2);
    expect(investGain(50 * MAN, 36, be)).toBeCloseTo(target, -3); // ±1,000원 수준
  });

  it('경계: 월납입 0 또는 기간 0 → break-even 0', () => {
    expect(breakEvenReturn(0, 36, 1_000_000)).toBe(0);
    expect(breakEvenReturn(50 * MAN, 0, 1_000_000)).toBe(0);
  });
});
