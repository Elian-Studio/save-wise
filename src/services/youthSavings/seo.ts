import type { RouteSeo } from '../../seo/head';

// 청년적금 계산기 — 이제 서브 경로(/youth-savings), 홈(/)은 패스픽 교통카드 추천.
export const youthSavingsSeo: RouteSeo = {
  path: '/youth-savings',
  title: '청년도약계좌 vs 청년미래적금 갈아타기 계산기 (2026)',
  description:
    '청년도약계좌 유지 vs 청년미래적금 갈아타기, 내 소득·거래은행으로 비교하고 가장 유리한 은행까지 찾는 무료 계산기. 1차 신규 접수는 마감(다음 접수 2026년 12월), 기가입자 계산은 계속 이용 가능.',
  keywords:
    '청년미래적금, 청년도약계좌, 청년미래적금 갈아타기, 청년도약계좌 갈아타기, 청년미래적금 은행, 청년미래적금 금리, 갈아타기 계산기, 정부기여금',
  canonical: 'https://choicewise.kr/youth-savings',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '도약계좌 없이 청년미래적금만 신규로 가입해도 되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네. 청년미래적금은 단독 신규 가입이 가능합니다(접수는 연 2회 — 1차는 2026-07-03 마감, 다음 접수 2026년 12월 예정). 도약계좌 보유자가 받는 ‘도약 연계’ 우대는, 신규 가입자도 대부분 은행에서 ‘첫거래(예적금 미보유)’ 조건으로 동일하게 받을 수 있습니다(해당 은행 직전 6개월~1년 예적금이 없는 첫거래 기준 — 기존 예적금이 있으면 빠질 수 있음).',
          },
        },
        {
          '@type': 'Question',
          name: '청년도약계좌에서 청년미래적금으로 갈아타면 기존 혜택을 잃나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '청년미래적금에 먼저 가입·계좌개설한 뒤 청년도약계좌를 ‘특별중도해지’하면 기존 납입분의 정부기여금과 비과세가 손실 없이 환급됩니다. 순서를 어겨 도약계좌를 먼저 해지하면 혜택이 사라집니다.',
          },
        },
        {
          '@type': 'Question',
          name: '청년미래적금 우대형(정부기여금 12%) 조건은 무엇인가요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '중소기업 신규취업자(전년도 최초 취업 + 현재 중소기업 재직 등)가 대표적입니다. 일반형은 납입액의 6%, 우대형은 12%를 정부가 매월 매칭 지급합니다.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'choicewise — 청년도약계좌 vs 청년미래적금 갈아타기 계산기',
      url: 'https://choicewise.kr/youth-savings',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      description:
        '청년도약계좌 유지 vs 청년미래적금 갈아타기를 내 소득·거래은행 기준으로 비교하고, 가장 유리한 은행까지 찾아주는 무료 계산기.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
  ],
};
