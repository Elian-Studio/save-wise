import type { RouteSeo } from '../../seo/head';
import { GUIDE_ARTICLES } from '../../data/guides';
import { stripMdLinks } from '../../lib/mdlink';

const SITE = 'https://choicewise.kr';
const ORG = { '@type': 'Organization', name: 'choicewise', url: SITE };

// transit/seo.ts의 faqPageLd와 동일 형태(그쪽은 미export라 로컬 재정의). 화면 FAQ와 mainEntity 일치.
// 본문 마크다운 링크 문법이 답변에 쓰여도 JSON-LD엔 라벨만 남긴다(화면 renderRich와 동일 문법 소스).
const faqPageLd = (faq: { q: string; a: string }[]): object => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: stripMdLinks(f.q),
    acceptedAnswer: { '@type': 'Answer', text: stripMdLinks(f.a) },
  })),
});

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
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: '가이드', item: `${SITE}/guide` },
      ],
    },
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
        datePublished: a.updatedAt,
        dateModified: a.updatedAt,
        author: ORG,
        publisher: ORG,
        mainEntityOfPage: url,
        inLanguage: 'ko-KR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: '가이드', item: `${SITE}/guide` },
          { '@type': 'ListItem', position: 3, name: a.title, item: url },
        ],
      },
      faqPageLd(a.body.faq),
    ],
  };
});
