import type { RouteSeo } from '../../seo/head';
import { BANKS } from '../../data/banks';
import { bankMaxRate, bankPrefLines } from '../../lib/bankPage';

// 청년적금 계산기 — 이제 서브 경로(/youth-savings), 홈(/)은 패스와이즈 교통카드 추천.
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

const HUB_URL = 'https://choicewise.kr/youth-savings/banks';

// 은행별 상세(/youth-savings/banks/:id) SEO. BANKS 단일 출처 + 엔진 최고금리에서 파생.
export const bankSeos: RouteSeo[] = BANKS.map((bank) => {
  const url = `${HUB_URL}/${bank.id}`;
  const rate = (bankMaxRate(bank) * 100).toFixed(1);
  const prefCount = bankPrefLines(bank).length - 1; // 기본금리 제외 우대 항목 수
  const ceil = bank.grp === 3 ? '8' : '7';
  const title = `${bank.name} 청년미래적금 금리·우대조건 — 최고 연 ${rate}% (2026)`;
  const description =
    `${bank.name} 청년미래적금 최고 연 ${rate}%(기관상한 ${ceil}%), 급여·카드·도약연계 등 우대 ${prefCount}개 항목을 은행연합회 정본으로 정리. 월 50만·36개월 예상 수령액 포함.`.slice(
      0,
      150,
    );
  const keywords = [
    `${bank.name} 청년미래적금`,
    `${bank.name} 미래적금 금리`,
    `${bank.name} 미래적금 우대조건`,
    `${bank.name} 청년미래적금 금리`,
    '청년미래적금 은행 비교',
    '청년미래적금 최고금리',
  ].join(', ');
  return {
    path: `/youth-savings/banks/${bank.id}`,
    title,
    description,
    keywords,
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: `${bank.name} 청년미래적금`,
        category: '청년미래적금',
        provider: { '@type': 'Organization', name: bank.name },
        interestRate: Number(rate),
        feesAndCommissionsSpecification: '비과세(이자소득세 면제)',
        description: `${bank.name} 청년미래적금 — 우대조건 모두 충족 시 최고 연 ${rate}%. 기본금리 5%·36개월·비과세.`,
        url,
        inLanguage: 'ko-KR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${bank.name} 청년미래적금 금리·우대조건`,
        description,
        url,
        inLanguage: 'ko-KR',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://choicewise.kr/youth-savings' },
          { '@type': 'ListItem', position: 2, name: '미래적금 은행', item: HUB_URL },
          { '@type': 'ListItem', position: 3, name: bank.name, item: url },
        ],
      },
    ],
  };
});

// 은행 비교 허브(/youth-savings/banks) SEO.
export const banksHubSeo: RouteSeo = {
  path: '/youth-savings/banks',
  title: '청년미래적금 은행별 금리 비교 — 14개 은행 최고금리·우대조건 (2026)',
  description:
    '청년미래적금 참여 14개 은행의 조건 충족 시 최고금리와 급여·카드·도약연계·출시 우대를 한 표로 비교. 기본금리 5%·36개월·비과세, 은행연합회 소비자포털 정본 기준.',
  keywords:
    '청년미래적금 은행, 청년미래적금 은행 비교, 청년미래적금 금리 비교, 청년미래적금 최고금리, 청년미래적금 우대조건, 미래적금 은행별 금리',
  canonical: HUB_URL,
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '청년미래적금 은행별 금리 비교',
      itemListElement: BANKS.map((bank, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${bank.name} 청년미래적금`,
        url: `${HUB_URL}/${bank.id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: 'https://choicewise.kr/youth-savings' },
        { '@type': 'ListItem', position: 2, name: '미래적금 은행', item: HUB_URL },
      ],
    },
  ],
};
