import type { RouteSeo } from '../../seo/head';

export const transitSeo: RouteSeo = {
  path: '/transit',
  title: 'K-패스 모두의카드 교통카드 추천 (나이·거주지별 2026)',
  description:
    '2026 K-패스 모두의카드, 내 나이·거주지·월 교통비로 어느 은행 어떤 카드가 가장 유리한지 추가할인·연회비까지 비교해 추천하는 무료 계산기.',
  keywords:
    'K패스, 모두의카드, K패스 카드 추천, 나이별 교통카드, 교통카드 추천, 기후동행카드, K패스 신용카드, K패스 체크카드',
  canonical: 'https://choicewise.kr/transit',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'choicewise — K-패스 교통카드 추천',
      url: 'https://choicewise.kr/transit',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      description:
        '내 나이·거주지·월 교통비 기준으로 K-패스(모두의카드)에 가장 유리한 카드사 카드를 추천하는 무료 계산기.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
  ],
};
