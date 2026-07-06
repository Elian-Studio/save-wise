import { describe, it, expect } from 'vitest';
import { recommend } from './transitSchemeRec';
import type { QuizAnswers } from './transitSchemeRec';
import { SCHEMES } from '../data/transitSchemes';
import { TRANSIT_CARDS } from '../data/transitCards';

const base: QuizAnswers = { region: 'seoul', age: 'y', trips: 'mid', mode: 'metro', bike: 'no' };
const ans = (over: Partial<QuizAnswers>): QuizAnswers => ({ ...base, ...over });

describe('recommend — 패스픽 추천 엔진', () => {
  it('서울 + 청년 + 60번 넘게 + 지하철 + 따릉이 자주 → 기후동행 1위', () => {
    const r = recommend(ans({ region: 'seoul', age: 'y', trips: 'lots', mode: 'metro', bike: 'often' }));
    expect(r.list[0].id).toBe('climate');
    expect(r.list[0].savings).toContain('아껴');
    expect(r.list[0].reasons.some((x) => x.includes('따릉이'))).toBe(true);
    expect(r.list.length).toBeGreaterThanOrEqual(3);
    expect(r.list[0].score).toBe(98);
  });

  it('경기도 + 35~39세 + 41~60번 + 광역 → 경기패스 1위, 30% 환급 23,250원', () => {
    const r = recommend(ans({ region: 'gg', age: 'y39', trips: 'many', mode: 'wide' }));
    expect(r.list[0].id).toBe('gyeonggi');
    expect(r.spend).toBe(77500);
    expect(r.list[0].benefit).toBe(23250);
    expect(r.list[0].savings).toContain('23,250');
  });

  it('인천 + 65세 이상 + 15~40번 → 인천 I-패스 1위, 30% 적용', () => {
    const r = recommend(ans({ region: 'ic', age: 'sr', trips: 'mid', mode: 'metro' }));
    expect(r.list[0].id).toBe('incheon');
    expect(r.list[0].benefit).toBe(13020); // 43,400 × 0.3
  });

  it('그 외 지역 + 40~64세 + 15번 미만 → 후불카드 1위 (93 > kpass 48)', () => {
    const r = recommend(ans({ region: 'etc', age: 'mid', trips: 'few', mode: 'metro' }));
    expect(r.list[0].id).toBe('postpaid');
    expect(r.list[0].score).toBe(93);
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.score).toBe(48); // 34 + 14(etc)
  });

  it('서울 + 광역(wide) + many → 기후동행 score가 30 깎여 60, K-패스에 밀림', () => {
    const r = recommend(ans({ region: 'seoul', age: 'y', trips: 'many', mode: 'wide', bike: 'no' }));
    const climate = r.list.find((x) => x.id === 'climate');
    expect(climate?.score).toBe(60); // 90 − 30
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass!.score).toBeGreaterThan(climate!.score);
    expect(r.list[0].id).toBe('kpass');
  });

  it('18세 이하(u19) → 성인 전용 카드 제외, 후불카드는 존재', () => {
    const r = recommend(ans({ region: 'gg', age: 'u19', trips: 'mid' }));
    const ids = r.list.map((x) => x.id);
    expect(ids).not.toContain('kpass');
    expect(ids).not.toContain('gyeonggi');
    expect(ids).not.toContain('incheon');
    expect(ids).toContain('postpaid');
  });

  it('trips=mid → tripN 28, spend 43,400', () => {
    const r = recommend(ans({ trips: 'mid' }));
    expect(r.tripN).toBe(28);
    expect(r.spend).toBe(43400);
  });

  it('list는 항상 score 내림차순 정렬', () => {
    const r = recommend(ans({ region: 'gg', age: 'y', trips: 'many', mode: 'mix', bike: 'some' }));
    for (let i = 1; i < r.list.length; i++) {
      expect(r.list[i - 1].score).toBeGreaterThanOrEqual(r.list[i].score);
    }
  });
});

describe('transitSchemes — 참조 무결성', () => {
  it("모든 kind:'card' 추천은 실존하고 단종되지 않은 카드를 가리킨다", () => {
    for (const s of SCHEMES) {
      for (const p of s.picks) {
        if (p.kind !== 'card') continue;
        const card = TRANSIT_CARDS.find((c) => c.id === p.cardId);
        expect(card, `${s.id} → ${p.cardId}`).toBeDefined();
        expect(card?.discontinued).not.toBe(true);
      }
    }
  });
});
