import { describe, it, expect } from 'vitest';
import { kpassNet, climateNet, cardAdd, rankCards, compare } from './transitCardRec';
import { TRANSIT_CARDS } from '../data/transitCards';

describe('kpassNet — 모두의카드 실부담(세 방식 최소)', () => {
  it('general·bs·fare 10만: 정률80k vs 일반형cap3만 vs 플러스cap5만 → 3만', () => {
    expect(kpassNet(100000, 'general', 'bs')).toBe(30000);
  });
  it('low·bs·fare 10만: 정률 46.7k vs 일반형cap 2.2만 → 2.2만', () => {
    // 반값표 확정(korea.kr 148962910): low(3자녀↑·저소득) 수도권 일반형 = 22,000.
    expect(kpassNet(100000, 'low', 'bs')).toBe(22000);
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
  it('flat: 조건 충족 시 정액, 미달 시 0', () => {
    expect(cardAdd(toss, 50000)).toBe(2000); // 4만↑
    expect(cardAdd(toss, 30000)).toBe(0);
  });
  it('pct: 월 한도 없는 경우 정률·100원 단위 내림', () => {
    const noCap = { ...toss, benefit: { kind: 'pct' as const, pct: 0.1, monthlyCap: null } };
    // 73000 × 10% = 7300 → 100원 단위 그대로
    expect(cardAdd(noCap, 73000)).toBe(7300);
  });
  it('pct: 월 한도 초과 시 cap', () => {
    // BC바로 15%, cap 3만. fare 30만 → 4.5만이나 cap 3만
    expect(cardAdd(bc, 300000)).toBe(30000);
  });
});

describe('rankCards — 필터·정렬(전월실적 반영)', () => {
  const HIGH = 1_000_000; // 실적 충분(모든 카드 자격)
  it('cardType=check만, discontinued(우리COOKIE) 제외, 순절감 내림차순', () => {
    const ranked = rankCards(70000, 'check', HIGH);
    expect(ranked.every((r) => r.card.type === 'check')).toBe(true);
    expect(ranked.some((r) => r.card.discontinued)).toBe(false);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].monthlyNet).toBeGreaterThanOrEqual(ranked[i].monthlyNet);
    }
  });
  it('연회비 있는 신용카드는 월환산 차감', () => {
    const ranked = rankCards(100000, 'credit', HIGH);
    const shinhan = ranked.find((r) => r.card.id === 'shinhan-credit')!;
    expect(shinhan.monthlyNet).toBe(shinhan.add - Math.round(10000 / 12));
  });

  it('전월실적 게이팅: 실적 없음이면 minPrevSpend>0 카드 혜택 0·미자격', () => {
    // 실적 0: KB국민 체크(전월 30만↑ 요건)는 자격 미달 → add 0
    const zero = rankCards(100000, 'check', 0);
    const kb = zero.find((r) => r.card.id === 'kb-check')!;
    expect(kb.eligible).toBe(false);
    expect(kb.add).toBe(0);
    // 실적 무관 카드(토스)는 자격 → 상위
    const toss = zero.find((r) => r.card.id === 'toss-check')!;
    expect(toss.eligible).toBe(true);
    expect(zero[0].card.minPrevSpend).toBe(0); // 1등은 실적 무관 카드
  });

  it('실적 충족 시 10% 카드가 자격 얻고 월 한도(2천) 적용', () => {
    // 전월 30만↑: KB국민 체크(10%·월 2천 한도) 자격 → fare 10만이어도 cap 2천
    const met = rankCards(100000, 'check', 300000);
    const kb = met.find((r) => r.card.id === 'kb-check')!;
    expect(kb.eligible).toBe(true);
    expect(kb.add).toBe(2000);
  });

  it('동률 타이브레이크: verified가 press보다, 실적 낮은 카드가 먼저', () => {
    const ranked = rankCards(100000, 'check', 1_000_000);
    for (let i = 1; i < ranked.length; i++) {
      const a = ranked[i - 1];
      const b = ranked[i];
      if (a.monthlyNet === b.monthlyNet) {
        const g = (x: string) => (x === 'verified' ? 0 : 1);
        // verified 우선, 같으면 실적 낮은 순
        expect(
          g(a.card.grade) < g(b.card.grade) ||
            (g(a.card.grade) === g(b.card.grade) && a.card.minPrevSpend <= b.card.minPrevSpend),
        ).toBe(true);
      }
    }
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
    // 제품 결정(연구 §4): 정률-only 손익분기는 성립하지 않아 breakeven 필드 제거, 승자는 실부담 직접 비교.
    const r = compare(120000, 'general', 'seoul', 'bs');
    expect(r.kpassNet).toBe(30000);
    expect(r.winner).toBe('kpass');
  });
  it('서울 아니면 기후동행 불가 → 무조건 kpass', () => {
    const r = compare(120000, 'general', 'metro', 'bs');
    expect(r.climateAvailable).toBe(false);
    expect(r.winner).toBe('kpass');
  });
  it('wide(GTX)는 일반형 캡 미적용 → 플러스 캡 5만 > 기후동행 불가 구간, kpass 실부담 5만', () => {
    // 일반형이 빠지는 wide에서도 승자 판정이 실부담 비교로 일관되는지 확인.
    const r = compare(120000, 'general', 'seoul', 'wide');
    expect(r.climateAvailable).toBe(false); // GTX는 기후동행 제외
    expect(r.kpassNet).toBe(50000);
    expect(r.winner).toBe('kpass');
  });
});
