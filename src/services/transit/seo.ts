import type { RouteSeo } from '../../seo/head';
import { SCHEMES } from '../../data/transitSchemes';

export const transitSeo: RouteSeo = {
  path: '/',
  title: '교통카드 추천 — 기후동행·K-패스 30초 진단 (2026)',
  description:
    '기후동행카드·K-패스·The 경기패스·인천 I-패스·후불카드 5개 제도를 30초 퀴즈로 비교해 내 거주지·나이·교통비에 딱 맞는 교통카드를 찾아주는 무료 진단.',
  keywords:
    '패스픽, 교통카드 추천, 교통카드 비교, 기후동행카드, K패스, K-패스, The 경기패스, 인천 I패스, 후불 교통카드, 나이별 교통카드',
  canonical: 'https://choicewise.kr/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'choicewise 패스픽 — 교통카드 추천',
      url: 'https://choicewise.kr/',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      description:
        '기후동행카드·K-패스·The 경기패스·인천 I-패스·후불카드를 거주지·나이·교통비 기준 30초 퀴즈로 비교해 가장 유리한 교통카드를 추천하는 무료 진단.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
  ],
};

// 제도별 상세 라우트(/transit/cards/:id) SEO. 데이터(SCHEMES) 단일 출처에서 파생.
export const schemeSeos: RouteSeo[] = SCHEMES.map((s) => {
  const url = `https://choicewise.kr/transit/cards/${s.id}`;
  const description = `${s.summary} ${s.tag}`.slice(0, 150);
  return {
    path: `/transit/cards/${s.id}`,
    title: `${s.name} 총정리 — 혜택·발급·이런 사람 (2026)`,
    description,
    keywords: [s.name, s.tag, ...s.fit].join(', '),
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${s.name} 총정리`,
        description,
        url,
        inLanguage: 'ko-KR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://choicewise.kr/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: '교통카드 추천',
            item: 'https://choicewise.kr/transit',
          },
          { '@type': 'ListItem', position: 3, name: s.name, item: url },
        ],
      },
    ],
  };
});
