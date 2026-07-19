import type { RouteSeo } from '../../seo/head';
import { BANKS } from '../../data/banks';
import { getBankGuide } from '../../data/bankGuides';
import { bankMaxRate, bankPrefLines } from '../../lib/bankPage';
import { faqPageLd, breadcrumbLd } from '../../seo/jsonld';

// 가시 렌더 FAQ = FAQPage 구조화 데이터. 화면 Q&A와 1:1 일치해야 함.
const YOUTH_SAVINGS_FAQ: { q: string; a: string }[] = [
  {
    q: '도약계좌 없이 청년미래적금만 신규로 가입해도 되나요?',
    a: '네. 청년미래적금은 단독 신규 가입이 가능합니다(접수는 연 2회 — 1차는 2026-07-03 마감, 다음 접수 2026년 12월 예정). 도약계좌 보유자가 받는 ‘도약 연계’ 우대는, 신규 가입자도 대부분 은행에서 ‘첫거래(예적금 미보유)’ 조건으로 동일하게 받을 수 있습니다(해당 은행 직전 6개월~1년 예적금이 없는 첫거래 기준 — 기존 예적금이 있으면 빠질 수 있음).',
  },
  {
    q: '청년도약계좌에서 청년미래적금으로 갈아타면 기존 혜택을 잃나요?',
    a: '청년미래적금에 먼저 가입·계좌개설한 뒤 청년도약계좌를 ‘특별중도해지’하면 기존 납입분의 정부기여금과 비과세가 손실 없이 환급됩니다. 순서를 어겨 도약계좌를 먼저 해지하면 혜택이 사라집니다.',
  },
  {
    q: '청년미래적금 우대형(정부기여금 12%) 조건은 무엇인가요?',
    a: '중소기업 신규취업자(전년도 최초 취업 + 현재 중소기업 재직 등)가 대표적입니다. 일반형은 납입액의 6%, 우대형은 12%를 정부가 매월 매칭 지급합니다.',
  },
];

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
    faqPageLd(YOUTH_SAVINGS_FAQ),
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

// 은행 허브 가시 FAQ = FAQPage 구조화 데이터. BanksHub 화면 Q&A와 1:1 일치해야 함.
export const BANKS_HUB_FAQ: { q: string; a: string }[] = [
  {
    q: '청년미래적금 최고금리가 은행마다 8%·7%로 갈리는 이유는?',
    a: '기본금리 5%·36개월·비과세는 14개 은행이 똑같고, 차이는 기관우대 상한입니다. KB국민·신한·하나·우리·NH농협·IBK기업·우체국은 상한이 3%p라 조건을 다 채우면 명목 최고 8%, 수협·iM뱅크·BNK부산·광주·전북·BNK경남·카카오뱅크는 2%p라 최고 7%입니다. 여기에 공통우대(총급여 3,600만원 이하 0.5%p·청년 재무상담 0.2%p)가 상한 범위 안에서 더해집니다.',
  },
  {
    q: '우대금리는 어떤 조건을 채워야 받나요?',
    a: '크게 세 축입니다. ① 급여이체 — 해당 은행 입출금 계좌로 급여를 일정 횟수·금액 이상 받기, ② 카드·실적 — 그 은행 신용/체크카드를 월 일정액 이상 쓰기, ③ 첫거래·도약연계 — 직전 6개월~1년 그 은행 예적금이 없거나 청년도약계좌를 연계. 조건과 %p는 은행마다 달라 각 은행 상세에서 은행연합회 공시 원문으로 확인해야 합니다.',
  },
  {
    q: '최고금리가 가장 높은 은행을 고르면 되나요?',
    a: '아니요. 표의 최고금리는 그 은행 우대를 전부 충족했을 때 값입니다. 급여계좌를 옮길 수 없거나 카드 실적을 못 채우면 그 %p는 빠져, 명목 8% 은행이 실제로는 6%대가 되기도 합니다. 내가 실제로 충족할 우대만 반영한 실질금리로 비교해야 하고, 계산기에 조건을 넣으면 자동으로 그렇게 계산합니다.',
  },
  {
    q: '케이뱅크·토스뱅크로도 가입할 수 있나요?',
    a: '케이뱅크는 청년미래적금에 참여하지 않습니다. 토스뱅크는 2026년 12월 별도 출시 예정이라 현재 비교 대상 14개 은행에는 포함되지 않습니다.',
  },
];

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
      breadcrumbLd([
        { name: '홈', item: 'https://choicewise.kr/youth-savings' },
        { name: '미래적금 은행', item: HUB_URL },
        { name: bank.name, item: url },
      ]),
      // 가이드 있는 7개 은행만 FAQPage 추가 — 화면 렌더 FAQ와 1:1 일치.
      ...(getBankGuide(bank.id) ? [faqPageLd(getBankGuide(bank.id)!.faq)] : []),
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
    faqPageLd(BANKS_HUB_FAQ),
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
    breadcrumbLd([
      { name: '홈', item: 'https://choicewise.kr/youth-savings' },
      { name: '미래적금 은행', item: HUB_URL },
    ]),
  ],
};
