import { describe, it, expect } from 'vitest';
import { GUIDE_ARTICLES, getGuide } from './index';

// 아티클 한 건의 전체 한글 본문 길이(intro + 섹션 문단/목록/표 + FAQ). AdSense 저품질 회복 목적상
// 각 아티클이 실질적 분량을 갖는지 가드한다.
function bodyTextLength(a: (typeof GUIDE_ARTICLES)[number]): number {
  const parts: string[] = [...a.body.intro];
  for (const s of a.body.sections) {
    parts.push(s.heading, ...s.paras);
    if (s.list) parts.push(...s.list);
    if (s.table) for (const t of s.table) parts.push(t.label, t.value);
  }
  for (const f of a.body.faq) parts.push(f.q, f.a);
  return parts.join('').length;
}

describe('GUIDE_ARTICLES 가이드 아티클', () => {
  it('slug가 유일하다', () => {
    const slugs = GUIDE_ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('updatedAt 내림차순으로 정렬돼 있다', () => {
    for (let i = 1; i < GUIDE_ARTICLES.length; i++) {
      expect(GUIDE_ARTICLES[i - 1].updatedAt >= GUIDE_ARTICLES[i].updatedAt).toBe(true);
    }
  });

  it('getGuide는 slug로 아티클을 찾고, 없으면 undefined', () => {
    expect(getGuide(GUIDE_ARTICLES[0].slug)?.slug).toBe(GUIDE_ARTICLES[0].slug);
    expect(getGuide('nope-nonexistent')).toBeUndefined();
  });

  it('각 아티클 본문이 충분히 길다(한글 ≥ 1,500자)', () => {
    for (const a of GUIDE_ARTICLES) {
      expect(bodyTextLength(a), a.slug).toBeGreaterThanOrEqual(1500);
    }
  });

  it('각 아티클 FAQ는 4개 이상, related href는 모두 /로 시작', () => {
    for (const a of GUIDE_ARTICLES) {
      expect(a.body.faq.length, a.slug).toBeGreaterThanOrEqual(4);
      expect(a.body.related.length, a.slug).toBeGreaterThan(0);
      for (const r of a.body.related) {
        expect(r.href.startsWith('/'), `${a.slug} ${r.href}`).toBe(true);
      }
    }
  });
});
