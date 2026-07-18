import type { RouteSeo } from '../../seo/head';
import { GUIDE_ARTICLES } from '../../data/guides';
import { stripMdLinks } from '../../lib/mdlink';
import { faqPageLd, breadcrumbLd } from '../../seo/jsonld';

const SITE = 'https://choicewise.kr';
const ORG = { '@type': 'Organization', name: 'choicewise', url: SITE };

export const guideListSeo: RouteSeo = {
  path: '/guide',
  title: '청년 돈 아끼는 가이드 — 교통카드·청년적금 실전 정리 (2026)',
  description:
    'K-패스·모두의카드, 청년도약계좌·청년미래적금 갈아타기까지. 청년이 실제로 헷갈리는 돈 문제를 계산기와 함께 짚어 주는 choicewise 가이드 모음.',
  keywords:
    '청년 돈 아끼기, 교통카드 가이드, 청년적금 가이드, 모두의카드, K-패스, 청년도약계좌, 청년미래적금, 갈아타기',
  canonical: `${SITE}/guide`,
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '청년 돈 아끼는 가이드',
      url: `${SITE}/guide`,
      inLanguage: 'ko-KR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: GUIDE_ARTICLES.length,
      itemListElement: GUIDE_ARTICLES.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: a.title,
        url: `${SITE}/guide/${a.slug}`,
      })),
    },
    breadcrumbLd([
      { name: '홈', item: `${SITE}/` },
      { name: '가이드', item: `${SITE}/guide` },
    ]),
  ],
};

// 아티클별 SEO(/guide/:slug). GUIDE_ARTICLES 단일 출처에서 파생.
export const articleSeos: RouteSeo[] = GUIDE_ARTICLES.map((a) => {
  const url = `${SITE}/guide/${a.slug}`;
  return {
    path: `/guide/${a.slug}`,
    title: a.title,
    description: stripMdLinks(a.description).slice(0, 155),
    keywords: a.keywords,
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: a.title,
        description: stripMdLinks(a.description),
        image: `${SITE}/og.jpg`,
        datePublished: a.updatedAt,
        dateModified: a.updatedAt,
        author: ORG,
        publisher: ORG,
        mainEntityOfPage: url,
        inLanguage: 'ko-KR',
      },
      breadcrumbLd([
        { name: '홈', item: `${SITE}/` },
        { name: '가이드', item: `${SITE}/guide` },
        { name: a.title, item: url },
      ]),
      faqPageLd(a.body.faq),
    ],
  };
});
