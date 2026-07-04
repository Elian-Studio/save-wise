// 교통카드 파인더 계산 엔진 — 순수 함수. 근거: docs/transit-card-spec.md.
// K-패스(모두의카드) 실부담 vs 기후동행 비교 + 카드사 추가혜택 순위.
import { KPASS, CLIMATE, TRANSIT_CARDS } from '../data/transitCards';
import type { AgeTier, CardType, TransitCard } from '../data/transitCards';

export type Region = 'seoul' | 'metro' | 'other';
export type Transit = 'bs' | 'wide' | 'bike';

/** K-패스 모두의카드 월 실부담 = fare − max(정률·일반형·플러스형 환급) = 세 방식 실부담 최소. */
export function kpassNet(fare: number, age: AgeTier, transit: Transit): number {
  const byRate = fare * (1 - KPASS.rate[age]);
  // 일반형(1회 3천원 미만 수단)은 wide(GTX·광역)엔 미적용. 플러스형은 전 수단.
  const byNormal = transit === 'wide' ? Infinity : Math.min(fare, KPASS.capNormal[age]);
  const byPlus = Math.min(fare, KPASS.capPlus[age]);
  return Math.round(Math.min(byRate, byNormal, byPlus));
}

/** 기후동행카드 월 실부담(무제한 정액). 서울·비-wide만 이용가능, 아니면 null. */
export function climateNet(age: AgeTier, region: Region, transit: Transit): number | null {
  if (region !== 'seoul' || transit === 'wide') return null;
  const base = CLIMATE.price[age];
  return transit === 'bike' ? base + CLIMATE.bikeAdd : base;
}

/** 카드 추가절감(전월실적 충족 가정). 100원 단위 내림. */
export function cardAdd(card: TransitCard, fare: number): number {
  const b = card.benefit;
  if (b.kind === 'flat') return fare >= b.minSpend ? b.amount : 0;
  const raw = fare * b.pct;
  const capped = b.monthlyCap == null ? raw : Math.min(raw, b.monthlyCap);
  return Math.floor(capped / 100) * 100;
}

export interface RankedCard {
  card: TransitCard;
  add: number; // 월 교통 추가절감(자격 미달이면 0)
  monthlyNet: number; // add − 연회비 월환산
  eligible: boolean; // 내 전월실적이 카드 요건(minPrevSpend) 충족 여부
}

const gradeRank = (g: TransitCard['grade']): number => (g === 'verified' ? 0 : 1);

/**
 * cardType 필터·discontinued 제외 후, 내 전월실적(prevSpend)에서 실제 받는 순절감으로 정렬.
 * 자격 미달(prevSpend < minPrevSpend) 카드는 add 0. 동률이면 verified·낮은 실적요건 우선.
 */
export function rankCards(fare: number, cardType: CardType, prevSpend: number): RankedCard[] {
  return TRANSIT_CARDS.filter((c) => c.type === cardType && !c.discontinued)
    .map((c) => {
      const eligible = prevSpend >= c.minPrevSpend;
      const add = eligible ? cardAdd(c, fare) : 0;
      return { card: c, add, monthlyNet: add - Math.round(c.annualFee / 12), eligible };
    })
    .sort(
      (a, z) =>
        z.monthlyNet - a.monthlyNet ||
        gradeRank(a.card.grade) - gradeRank(z.card.grade) ||
        a.card.minPrevSpend - z.card.minPrevSpend,
    );
}

export interface TransitResult {
  kpassNet: number;
  climateNet: number | null;
  climateAvailable: boolean;
  winner: 'kpass' | 'climate';
}

/** K-패스 vs 기후동행 비교. 승자는 실부담 직접 비교 — 모두의카드(캡 존재) 하에서
 *  정률-only 손익분기(정액/(1−rate))는 성립하지 않아 제공하지 않는다(연구 §4). */
export function compare(fare: number, age: AgeTier, region: Region, transit: Transit): TransitResult {
  const kNet = kpassNet(fare, age, transit);
  const cNet = climateNet(age, region, transit);
  const available = cNet != null;
  return {
    kpassNet: kNet,
    climateNet: cNet,
    climateAvailable: available,
    winner: available && cNet < kNet ? 'climate' : 'kpass',
  };
}
