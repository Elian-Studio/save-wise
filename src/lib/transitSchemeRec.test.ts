import { describe, it, expect } from 'vitest';
import { recommend } from './transitSchemeRec';
import type { QuizAnswers } from './transitSchemeRec';
import { SCHEMES } from '../data/transitSchemes';
import { TRANSIT_CARDS } from '../data/transitCards';

const base: QuizAnswers = { region: 'seoul', age: 'y', trips: 'mid', mode: 'metro', bike: 'no' };
const ans = (over: Partial<QuizAnswers>): QuizAnswers => ({ ...base, ...over });

describe('recommend — 패스픽 추천 엔진(이중 환급)', () => {
  it('서울+청년+lots+지하철+따릉이 → K-패스 1위(기준금액 초과분 74,200원)', () => {
    // spend 99,200. kpass youth: max(round(99200*0.3)=29,760, 99200-25000=74,200)=74,200
    // climate: 99,200-62,000=37,200
    const r = recommend(ans({ region: 'seoul', age: 'y', trips: 'lots', mode: 'metro', bike: 'often' }));
    expect(r.list[0].id).toBe('kpass');
    expect(r.list[0].benefit).toBe(74200);
    expect(r.list[0].savings).toContain('74,200');
    expect(r.list[0].reasons.some((x) => x.includes('기준금액') && x.includes('2.5만원'))).toBe(true);
    const climate = r.list.find((x) => x.id === 'climate');
    expect(climate?.benefit).toBe(37200);
  });

  it('경기+y39+many+광역 → 경기패스 1위(기준금액 초과분 32,500 > K-패스 27,500)', () => {
    // spend 77,500. gyeonggi youth wide: max(round(77500*0.3)=23,250, 77500-45000=32,500)=32,500
    // kpass general wide: max(round(77500*0.2)=15,500, 77500-50000=27,500)=27,500
    const r = recommend(ans({ region: 'gg', age: 'y39', trips: 'many', mode: 'wide' }));
    expect(r.list[0].id).toBe('gyeonggi');
    expect(r.spend).toBe(77500);
    expect(r.list[0].benefit).toBe(32500);
    expect(r.list[0].savings).toContain('32,500');
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.benefit).toBe(27500);
  });

  it('인천+어르신+mid+지하철 → 인천 I-패스 1위(benefit 동점, score로 K-패스 제침)', () => {
    // spend 43,400. incheon senior: max(round(43400*0.3)=13,020, 43400-25000=18,400)=18,400
    // kpass senior: 동일 18,400 → tie, score ic 88 > kpass 76
    const r = recommend(ans({ region: 'ic', age: 'sr', trips: 'mid', mode: 'metro' }));
    expect(r.list[0].id).toBe('incheon');
    expect(r.list[0].benefit).toBe(18400);
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.benefit).toBe(18400);
  });

  it('K-패스 어르신 30% 버그 수정: etc+sr+mid → benefit 18,400 (구 8,680 아님)', () => {
    // spend 43,400. kpass senior: max(round(43400*0.3)=13,020, 43400-25000=18,400)=18,400
    const r = recommend(ans({ region: 'etc', age: 'sr', trips: 'mid', mode: 'metro' }));
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.benefit).toBe(18400);
    expect(kpass?.benefit).not.toBe(8680);
  });

  it('few → 계열 자격 미달, 후불카드 1위', () => {
    // trips few: kpass/gyeonggi/incheon 자격 없음(eligible=false) → 후불(eligible) 우선
    const r = recommend(ans({ region: 'etc', age: 'mid', trips: 'few', mode: 'metro' }));
    expect(r.list[0].id).toBe('postpaid');
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.eligible).toBe(false);
  });

  it('u19 → 성인 전용(kpass/gyeonggi/incheon) 제외, 후불카드는 존재', () => {
    const r = recommend(ans({ region: 'gg', age: 'u19', trips: 'mid' }));
    const ids = r.list.map((x) => x.id);
    expect(ids).not.toContain('kpass');
    expect(ids).not.toContain('gyeonggi');
    expect(ids).not.toContain('incheon');
    expect(ids).toContain('postpaid');
  });

  it('기준금액 문구는 초과분이 이길 때만: 비율이 이기면 문구 없음', () => {
    // 서울+y+mid+wide: spend 43,400, capPlus youth 45,000 → 초과분 -1,600 → 비율 13,020 승 → 문구 없음
    const r = recommend(ans({ region: 'seoul', age: 'y', trips: 'mid', mode: 'wide' }));
    const kpass = r.list.find((x) => x.id === 'kpass');
    expect(kpass?.benefit).toBe(13020);
    expect(kpass?.reasons.some((x) => x.includes('기준금액'))).toBe(false);
  });

  it('정렬 불변식: eligible desc → benefit desc → score desc', () => {
    // 경기+y+few+mix: kpass/gyeonggi 자격 미달(4,650), 후불 eligible(1,550)
    const r = recommend(ans({ region: 'gg', age: 'y', trips: 'few', mode: 'mix' }));
    for (let i = 1; i < r.list.length; i++) {
      const p = r.list[i - 1];
      const q = r.list[i];
      if (p.eligible !== q.eligible) {
        expect(p.eligible).toBe(true);
        expect(q.eligible).toBe(false);
      } else if (p.benefit !== q.benefit) {
        expect(p.benefit).toBeGreaterThan(q.benefit);
      } else {
        expect(p.score).toBeGreaterThanOrEqual(q.score);
      }
    }
    // 첫 자리는 eligible한 후불(benefit이 낮아도 자격이 이긴다)
    expect(r.list[0].id).toBe('postpaid');
  });

  it('trips=mid → tripN 28, spend 43,400', () => {
    const r = recommend(ans({ trips: 'mid' }));
    expect(r.tripN).toBe(28);
    expect(r.spend).toBe(43400);
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
