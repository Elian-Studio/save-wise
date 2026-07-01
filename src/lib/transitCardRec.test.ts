import { describe, it, expect } from 'vitest';
import { kpassNet, climateNet, cardAdd, rankCards, compare } from './transitCardRec';
import { TRANSIT_CARDS, KPASS } from '../data/transitCards';

describe('kpassNet — 모두의카드 실부담(세 방식 최소)', () => {
  it('general·bs·fare 10만: 정률80k vs 일반형cap3만 vs 플러스cap5만 → 3만', () => {
    expect(kpassNet(100000, 'general', 'bs')).toBe(30000);
  });
  it('low·bs·fare 10만: 정률 46.7k vs 일반형cap2만 → 2만', () => {
    expect(kpassNet(100000, 'low', 'bs')).toBe(20000);
  });
  it('wide(GTX)는 일반형 미적용 → 정률 vs 플러스cap 중 최소', () => {
    // general fare 10만: 정률8만 vs 플러스cap5만 → 5만 (일반형 3만은 wide라 제외)
    expect(kpassNet(100000, 'general', 'wide')).toBe(50000);
  });
  it('저액 구간은 정률이 cap보다 작아 정률 적용', () => {
    // general fare 2만: 정률1.6만 < 일반형cap min(2만,3만)=2만 → 1.6만
    expect(kpassNet(20000, 'general', 'bs')).toBe(16000);
  });
});

describe('climateNet — 기후동행 이용가부', () => {
  it('서울·지하철버스·general = 62000', () => {
    expect(climateNet('general', 'seoul', 'bs')).toBe(62000);
  });
  it('청년 + 따릉이 = 55000 + 3000', () => {
    expect(climateNet('youth', 'seoul', 'bike')).toBe(58000);
  });
  it('수도권(metro)은 이용 불가 → null', () => {
    expect(climateNet('general', 'metro', 'bs')).toBeNull();
  });
  it('wide(GTX)는 서울이어도 불가 → null', () => {
    expect(climateNet('general', 'seoul', 'wide')).toBeNull();
  });
});

describe('cardAdd — 카드 추가절감', () => {
  const toss = TRANSIT_CARDS.find((c) => c.id === 'toss-check')!;
  const bc = TRANSIT_CARDS.find((c) => c.id === 'bc-baro')!;
  const shinhan = TRANSIT_CARDS.find((c) => c.id === 'shinhan-credit')!;
  it('flat: 조건 충족 시 정액, 미달 시 0', () => {
    expect(cardAdd(toss, 50000)).toBe(2000); // 4만↑
    expect(cardAdd(toss, 30000)).toBe(0);
  });
  it('pct: 10% (한도 없음) 100원 단위 내림', () => {
    expect(cardAdd(shinhan, 73000)).toBe(7300);
  });
  it('pct: 월 한도 초과 시 cap', () => {
    // BC바로 15%, cap 3만. fare 30만 → 4.5만이나 cap 3만
    expect(cardAdd(bc, 300000)).toBe(30000);
  });
});

describe('rankCards — 필터·정렬', () => {
  it('cardType=check만, discontinued(우리COOKIE) 제외, 순절감 내림차순', () => {
    const ranked = rankCards(70000, 'check');
    expect(ranked.every((r) => r.card.type === 'check')).toBe(true);
    expect(ranked.some((r) => r.card.discontinued)).toBe(false);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].monthlyNet).toBeGreaterThanOrEqual(ranked[i].monthlyNet);
    }
  });
  it('연회비 있는 신용카드는 월환산 차감', () => {
    const ranked = rankCards(100000, 'credit');
    const shinhan = ranked.find((r) => r.card.id === 'shinhan-credit')!;
    expect(shinhan.monthlyNet).toBe(shinhan.add - Math.round(10000 / 12));
  });
});

describe('compare — K-패스 vs 기후동행', () => {
  it('저액이면 K-패스 승(기후동행 정액이 더 비쌈)', () => {
    const r = compare(40000, 'general', 'seoul', 'bs');
    expect(r.winner).toBe('kpass');
    expect(r.climateAvailable).toBe(true);
  });
  it('모두의카드 cap(반값 3만)이 기후동행(6.2만)보다 낮아 고액에도 K-패스 승', () => {
    // 2026 모두의카드: 일반형 실부담이 기준금액 3만에 캡 → 기후동행 6.2만보다 항상 저렴.
    // 디자인의 정률-only 손익분기 전제가 무너지는 지점(제품 결정 필요, 기준금액[R] 의존).
    const r = compare(120000, 'general', 'seoul', 'bs');
    expect(r.kpassNet).toBe(30000);
    expect(r.winner).toBe('kpass');
  });
  it('서울 아니면 기후동행 불가 → 무조건 kpass', () => {
    const r = compare(120000, 'general', 'metro', 'bs');
    expect(r.climateAvailable).toBe(false);
    expect(r.winner).toBe('kpass');
  });
  it('손익분기 = 정액/(1−정률)', () => {
    const r = compare(80000, 'general', 'seoul', 'bs');
    expect(r.breakeven).toBe(Math.round(62000 / (1 - KPASS.rate.general)));
  });
});
