import { describe, it, expect } from 'vitest';
import { BANKS, getBank, type Bank } from '../data/banks';
import { MIRAE } from '../data/products';
import { bankMaxInputs, bankMaxRate, bankEstimate, bankPrefLines } from './bankPage';

// 기관 상한 캡 전, banks.ts + 공통우대의 순수 우대 합(소수).
function rawPrefSum(bank: Bank): number {
  return (
    (bank.salaryPref ?? 0) +
    (bank.cardPref ?? 0) +
    (bank.switchPref ?? 0) +
    bank.launchBonus +
    MIRAE.lowIncomeBonus +
    MIRAE.advisoryBonus
  );
}

describe('bankPage — 은행별 최고금리 파생', () => {
  it('모든 은행의 최고금리는 [5%, 8%] 범위이고 기본+기관상한을 넘지 않는다', () => {
    for (const b of BANKS) {
      const r = bankMaxRate(b);
      const groupMax = b.grp === 3 ? 0.03 : 0.02;
      expect(r).toBeGreaterThanOrEqual(0.05);
      expect(r).toBeLessThanOrEqual(0.08);
      expect(r).toBeLessThanOrEqual(MIRAE.baseRate + groupMax + 1e-9);
    }
  });

  it('grp3 은행이 상한에 도달하면(우리) 최고금리는 8%', () => {
    const woori = getBank('woori')!;
    expect(woori.grp).toBe(3);
    expect(rawPrefSum(woori)).toBeGreaterThanOrEqual(0.03); // 캡 초과
    expect(bankMaxRate(woori)).toBeCloseTo(0.08, 10);
  });

  it('grp3 은행이 상한에 못 미치면(신한) 8% 미만이고 기본+우대합과 일치', () => {
    const shinhan = getBank('shinhan')!;
    expect(shinhan.grp).toBe(3);
    const expected = MIRAE.baseRate + Math.min(rawPrefSum(shinhan), 0.03);
    expect(bankMaxRate(shinhan)).toBeCloseTo(expected, 10);
    expect(bankMaxRate(shinhan)).toBeLessThan(0.08);
  });

  it('모든 은행의 예상수령액 원금 = 월 50만 × 36개월', () => {
    for (const b of BANKS) {
      expect(bankEstimate(b, 'gen').principal).toBe(500000 * 36);
      expect(bankEstimate(b, 'pref').principal).toBe(500000 * 36);
    }
  });

  it('우대형 정부기여금은 일반형보다 크다', () => {
    const kakao = getBank('kakao')!;
    expect(bankEstimate(kakao, 'pref').contrib).toBeGreaterThan(bankEstimate(kakao, 'gen').contrib);
  });

  it('bankMaxInputs는 전 항목을 해당 은행으로 지정한다', () => {
    const kb = getBank('kb')!;
    const I = bankMaxInputs(kb, 'gen');
    expect(I.payBank).toBe('kb');
    expect(I.mainBank).toBe('kb');
    expect(I.cardCo).toBe('kb');
    expect(I.miraeMonthly).toBe(500000);
  });

  it('bankPrefLines는 기본금리 + non-null 항목 + 공통우대 2건을 담는다', () => {
    const lines = bankPrefLines(getBank('woori')!);
    expect(lines[0]).toEqual({ label: '기본금리', pp: 0.05, cond: '전 기관 공통' });
    expect(lines.some((l) => l.label === '출시·한시')).toBe(true); // woori launchBonus>0
    expect(lines.filter((l) => l.label.startsWith('공통우대'))).toHaveLength(2);

    // switchPref가 null인 은행(우체국)은 도약연계 라인이 없다.
    const post = bankPrefLines(getBank('post')!);
    expect(post.some((l) => l.label === '도약연계·첫거래')).toBe(false);
    // 카드 우대가 null인 은행(광주)은 카드 라인이 없다.
    const gwangju = bankPrefLines(getBank('gwangju')!);
    expect(gwangju.some((l) => l.label === '카드·실적')).toBe(false);
  });
});
