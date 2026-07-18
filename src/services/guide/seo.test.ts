import { describe, it, expect } from 'vitest';
import { guideListSeo, articleSeos } from './seo';
import { ROUTE_SEO } from '@/seo/routes';
import { GUIDE_ARTICLES } from '@/data/guides';

// 본문 문자열의 [라벨](href) → 라벨. GuideArticlePage.renderRich와 동일 규칙(테스트 로컬).
const stripMdLinks = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
const ld = (seo: { jsonLd: object[] }, type: string) =>
  seo.jsonLd.find((o) => (o as { '@type'?: string })['@type'] === type) as
    | Record<string, unknown>
    | undefined;

describe('가이드 SEO 파생(guideListSeo, articleSeos)', () => {
  it('guideListSeo + 모든 articleSeo path가 ROUTE_SEO에 등록돼 프리렌더 대상', () => {
    const paths = [guideListSeo.path, ...articleSeos.map((s) => s.path)];
    for (const p of paths) {
      expect(ROUTE_SEO.some((s) => s.path === p), p).toBe(true);
    }
  });

  it('아티클마다 seo가 하나씩 파생된다', () => {
    expect(articleSeos).toHaveLength(GUIDE_ARTICLES.length);
  });

  it('각 articleSeo description은 ≤155자이고 마크다운 링크 문법이 없다', () => {
    for (const seo of articleSeos) {
      expect(seo.description.length, seo.path).toBeLessThanOrEqual(155);
      expect(seo.description, seo.path).not.toMatch(/\]\(/);
      expect(seo.description).toBe(stripMdLinks(seo.description));
    }
  });

  it('FAQPage mainEntity Q/A가 아티클 body.faq(스트립 후)와 일치', () => {
    for (const a of GUIDE_ARTICLES) {
      const seo = articleSeos.find((s) => s.path === `/guide/${a.slug}`)!;
      const faqLd = ld(seo, 'FAQPage')!;
      const entities = faqLd.mainEntity as Array<{
        name: string;
        acceptedAnswer: { text: string };
      }>;
      expect(entities).toHaveLength(a.body.faq.length);
      entities.forEach((e, i) => {
        expect(e.name).toBe(stripMdLinks(a.body.faq[i].q));
        expect(e.acceptedAnswer.text).toBe(stripMdLinks(a.body.faq[i].a));
      });
    }
  });

  it('guideListSeo ItemList numberOfItems === GUIDE_ARTICLES.length', () => {
    expect((ld(guideListSeo, 'ItemList')!.numberOfItems as number)).toBe(GUIDE_ARTICLES.length);
  });

  it('Article JSON-LD: datePublished === updatedAt, author/publisher에 url', () => {
    for (const a of GUIDE_ARTICLES) {
      const seo = articleSeos.find((s) => s.path === `/guide/${a.slug}`)!;
      const art = ld(seo, 'Article')!;
      expect(art.datePublished).toBe(a.updatedAt);
      expect(art.dateModified).toBe(a.updatedAt);
      expect((art.author as { url?: string }).url).toBe('https://choicewise.kr');
      expect((art.publisher as { url?: string }).url).toBe('https://choicewise.kr');
    }
  });
});
