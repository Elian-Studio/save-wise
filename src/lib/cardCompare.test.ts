import { describe, it, expect } from 'vitest';
import { TRANSIT_CARDS } from '../data/transitCards';
import { resolveBenefit, cardBenefit, benefitSummary } from './cardCompare';

const byId = (id: string) => {
  const c = TRANSIT_CARDS.find((x) => x.id === id);
  if (!c) throw new Error(`테스트 데이터 없음: ${id}`);
  return c;
};

describe('cardBenefit — 카드 추가혜택 계산', () => {
  it('정률(pct) 카드는 월 한도로 캡된다', () => {
    const kb = byId('kb-check'); // pct 10% · 월 2,000원 한도, 전월 30만↑
    if (kb.benefit.kind !== 'pct') throw new Error('전제 위반');
    // 교통 7만 × 10% = 7,000 > 한도 2,000 → 한도로 캡
    expect(cardBenefit(kb, 70000, 500000)).toBe(kb.benefit.monthlyCap);
    expect(7000).toBeGreaterThan(kb.benefit.monthlyCap ?? 0);
  });

  it('정액(flat) 카드는 minSpend 미만이면 0, 이상이면 amount', () => {
    const toss = byId('toss-check'); // flat 2,000원, 교통 4만↑, 무실적
    if (toss.benefit.kind !== 'flat') throw new Error('전제 위반');
    const { amount, minSpend } = toss.benefit;
    expect(cardBenefit(toss, minSpend - 10000, 500000)).toBe(0);
    expect(cardBenefit(toss, minSpend + 10000, 500000)).toBe(amount);
  });

  it('전월실적이 minPrevSpend 미만이면 혜택 0 (실적 미충족)', () => {
    const kb = byId('kb-check'); // 전월 30만↑ 필요
    expect(resolveBenefit(kb, kb.minPrevSpend - 100000)).toBeNull();
    expect(cardBenefit(kb, 70000, kb.minPrevSpend - 100000)).toBe(0);
  });

  it('상위 실적 구간(tier)을 넘으면 상향된 한도를 쓴다', () => {
    const nh = byId('nh-check'); // base 월 3천, 80만↑ 구간 월 5천
    const tier = nh.tiers?.[0];
    if (!tier || tier.benefit.kind !== 'pct') throw new Error('전제 위반: tier 카드');
    const base = cardBenefit(nh, 70000, 500000); // base 구간
    const upper = cardBenefit(nh, 70000, tier.minPrevSpend); // tier 구간
    expect(upper).toBeGreaterThan(base);
    expect(upper).toBe(tier.benefit.monthlyCap); // 7만×10%=7천 > 5천 → tier 한도로 캡
  });
});

describe('benefitSummary — 혜택 라벨', () => {
  it('pct 카드는 비율과 월 한도를 함께 표기', () => {
    expect(benefitSummary(byId('kb-check'))).toBe('대중교통 10% · 월 2,000원 한도');
  });

  it('한도 없는 pct 카드는 "한도 없음"', () => {
    expect(benefitSummary(byId('woori-credit'))).toBe('대중교통 10% · 한도 없음');
  });

  it('flat 카드는 최소 교통비 조건을 표기', () => {
    expect(benefitSummary(byId('toss-check'))).toBe('월 4만↑ 시 2,000원');
  });
});
