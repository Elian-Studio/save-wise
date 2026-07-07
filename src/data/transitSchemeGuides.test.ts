import { describe, it, expect } from 'vitest';
import { SCHEME_GUIDES, HOME_FAQ } from './transitSchemeGuides';
import { SCHEMES } from './transitSchemes';
import { kpassRefund } from '../lib/transitSchemeRec';

describe('SCHEME_GUIDES 제도별 가이드', () => {
  it('5개 제도 모두 가이드가 존재하고 필수 필드가 채워져 있다', () => {
    for (const s of SCHEMES) {
      const g = SCHEME_GUIDES[s.id];
      expect(g, s.id).toBeTruthy();
      expect(g.eligibility.paras.length).toBeGreaterThanOrEqual(2);
      expect(g.applyDetail.length).toBeGreaterThanOrEqual(3);
      expect(g.calcExample.rows.length).toBeGreaterThan(0);
      expect(g.cautions.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('각 제도 FAQ는 3~5개', () => {
    for (const s of SCHEMES) {
      const n = SCHEME_GUIDES[s.id].faq.length;
      expect(n, s.id).toBeGreaterThanOrEqual(3);
      expect(n, s.id).toBeLessThanOrEqual(5);
    }
  });

  it('HOME_FAQ는 4~5개', () => {
    expect(HOME_FAQ.length).toBeGreaterThanOrEqual(4);
    expect(HOME_FAQ.length).toBeLessThanOrEqual(5);
  });

  // 드리프트 가드: kpass 계산 예시의 환급액 행이 실제 kpassRefund 결과 포맷과 일치해야 함.
  it('kpass calcExample 환급액 행 = kpassRefund(93000,youth,false).refund 포맷', () => {
    const expected = `${kpassRefund(93000, 'youth', false).refund.toLocaleString('ko-KR')}원`;
    const rows = SCHEME_GUIDES.kpass.calcExample.rows;
    const last = rows[rows.length - 1];
    expect(last.value).toBe(expected);
    expect(last.value).toBe('68,000원');
  });
});
