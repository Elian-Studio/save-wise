// K-패스 카드 비교용 순수 계산. 정부환급(kpassRefund)과 별개인 카드사 추가혜택만 계산한다.
// 근거 데이터: src/data/transitCards.ts (전월실적 구간·월 한도). grade=press 항목은 UI에서 신뢰도 노출.
import type { TransitCard, Benefit } from '../data/transitCards';

/** 전월실적으로 적용 혜택을 결정. 상위 tier(높은 실적) 우선, 없으면 base, 실적 미충족이면 null. */
export function resolveBenefit(card: TransitCard, prevSpend: number): Benefit | null {
  if (card.tiers) {
    // 조건 충족하는 가장 높은 실적 구간이 base를 대체
    const top = card.tiers
      .filter((t) => t.minPrevSpend <= prevSpend)
      .sort((a, b) => b.minPrevSpend - a.minPrevSpend)[0];
    if (top) return top.benefit;
  }
  return prevSpend >= card.minPrevSpend ? card.benefit : null;
}

/** 월 교통비(spend)·전월실적(prevSpend) 기준 카드 추가혜택(원). 실적 미충족·조건 미달이면 0. */
export function cardBenefit(card: TransitCard, spend: number, prevSpend: number): number {
  const b = resolveBenefit(card, prevSpend);
  if (!b) return 0;
  if (b.kind === 'pct') return Math.min(Math.round(spend * b.pct), b.monthlyCap ?? Infinity);
  return spend >= b.minSpend ? b.amount : 0;
}

/** 비교 표 '혜택' 열용 짧은 라벨(base 구간 기준). */
export function benefitSummary(card: TransitCard): string {
  const b = card.benefit;
  if (b.kind === 'pct') {
    const rate = `대중교통 ${Math.round(b.pct * 100)}%`;
    return b.monthlyCap == null
      ? `${rate} · 한도 없음`
      : `${rate} · 월 ${b.monthlyCap.toLocaleString('ko-KR')}원 한도`;
  }
  return b.minSpend > 0
    ? `월 ${b.minSpend / 10000}만↑ 시 ${b.amount.toLocaleString('ko-KR')}원`
    : `대중교통 이용 시 ${b.amount.toLocaleString('ko-KR')}원`;
}
