import type { RouteSeo } from '../../seo/head';
import { SCHEMES } from '../../data/transitSchemes';
import { SCHEME_GUIDES, HOME_FAQ } from '../../data/transitSchemeGuides';
import { TRANSIT_CARDS, type CardType, type TransitCard } from '../../data/transitCards';
import { cardBenefit } from '../../lib/cardCompare';
import { faqPageLd, breadcrumbLd } from '../../seo/jsonld';

export const transitSeo: RouteSeo = {
  path: '/',
  title: '교통카드 추천 — K-패스·경기패스 30초 진단 (2026)',
  description:
    'K-패스·The 경기패스·인천 I-패스·후불카드를 30초 퀴즈로 비교해 내 거주지·나이·교통비에 딱 맞는 교통카드를 찾아주는 무료 진단. 기후동행카드는 30일권 충전 종료(2026-07-31) 안내 포함.',
  keywords:
    '패스와이즈, 교통카드 추천, 교통카드 비교, K패스, K-패스, The 경기패스, 인천 I패스, 후불 교통카드, 나이별 교통카드, 기후동행카드, 기후동행카드 종료',
  canonical: 'https://choicewise.kr/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'choicewise 패스와이즈 — 교통카드 추천',
      url: 'https://choicewise.kr/',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      description:
        'K-패스·The 경기패스·인천 I-패스·후불카드를 거주지·나이·교통비 기준 30초 퀴즈로 비교해 가장 유리한 교통카드를 추천하는 무료 진단. 기후동행카드 30일권은 2026-07-31 충전 종료.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
    faqPageLd(HOME_FAQ),
  ],
};

// 제도별 상세 라우트(/transit/cards/:id) SEO. 데이터(SCHEMES) 단일 출처에서 파생.
export const schemeSeos: RouteSeo[] = SCHEMES.map((s) => {
  const url = `https://choicewise.kr/transit/cards/${s.id}`;
  const description = `${s.summary} ${s.tag}`.slice(0, 150);
  // 종료 제도(endNotice)는 검색 의도가 '종료/폐지 안내'로 이동하므로 title·keywords를 종료형으로 조준.
  const title = s.endNotice
    ? `${s.name} 충전 종료 — 마감 일정·기존 카드·K-패스 전환 (2026)`
    : `${s.name} 총정리 — 혜택·발급·이런 사람 (2026)`;
  const keywords = s.endNotice
    ? [s.name, `${s.name} 종료`, `${s.name} 충전 종료`, `${s.name} 폐지`, 'K-패스 전환', ...s.fit].join(', ')
    : [s.name, s.tag, ...s.fit].join(', ');
  return {
    path: `/transit/cards/${s.id}`,
    title,
    description,
    keywords,
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: s.endNotice ? `${s.name} 충전 종료 안내` : `${s.name} 총정리`,
        description,
        url,
        inLanguage: 'ko-KR',
      },
      breadcrumbLd([
        { name: '홈', item: 'https://choicewise.kr/' },
        { name: s.name, item: url },
      ]),
      faqPageLd(SCHEME_GUIDES[s.id].faq),
    ],
  };
});

// K-패스 카드 비교(/transit/cards/compare/:type) SEO. 정부환급 동일·카드사 추가혜택이 차이.
// CardCompare 페이지와 동일 고정 시나리오(월 교통 7만·전월실적 50만·일반)로 순위를 파생한다.
const CMP_SPEND = 70000;
const CMP_PREV = 500000;
const displayName = (c: TransitCard): string =>
  c.name.includes(c.issuer) ? c.name : `${c.issuer} ${c.name}`;

// 비교 페이지 가시 FAQ = FAQPage 구조화 데이터. CardCompare 화면 Q&A와 1:1 일치. type별로 다름.
export const cardCompareFaq = (type: CardType): { q: string; a: string }[] =>
  type === 'check'
    ? [
        {
          q: 'K-패스 체크카드도 정부 환급을 똑같이 받나요?',
          a: '네. 월 15회 이상 이용하면 정부 환급은 어떤 K-패스 카드로 타든 동일합니다. 체크·신용, 카드사와 무관해요. 이 표에서 비교하는 건 그 위에 카드사가 얹어 주는 추가혜택뿐입니다.',
        },
        {
          q: '전월실적이 뭔가요? 교통비도 실적에 들어가나요?',
          a: '전월실적은 지난달 그 카드로 쓴 금액입니다. 체크카드 추가혜택은 대개 전월 30만원 실적을 채워야 나오고, 대부분 카드는 교통비가 실적에 안 잡혀 다른 지출로 따로 채워야 합니다(NH농협 체크처럼 교통비도 실적에 포함되는 카드는 예외). 토스뱅크 K-패스 체크처럼 실적 조건이 아예 없는 카드도 있습니다.',
        },
        {
          q: '체크카드가 신용카드보다 유리한 경우는?',
          a: '교통비가 적고 전월실적 채우기가 부담스러운 경우입니다. 체크는 비교 대상 전부 연회비가 없고 실적 문턱이 낮은 대신, 월 추가혜택 한도가 2천~4천원대로 작습니다. 교통비를 많이 쓰고 실적을 쉽게 채운다면 한도가 큰 신용카드가 유리할 수 있으니 신용카드 비교도 함께 보세요.',
        },
      ]
    : [
        {
          q: '신용카드를 쓰면 정부 환급을 더 받나요?',
          a: '아니요. 정부 환급은 카드 종류·카드사와 무관하게 동일합니다(월 15회 이상). 신용카드에서 더 커지는 건 정부 환급이 아니라 카드사 추가혜택의 월 한도입니다.',
        },
        {
          q: '전월실적 30만·50만은 무슨 차이인가요?',
          a: '추가혜택을 받으려면 지난달 그 카드로 그만큼 써야 한다는 뜻입니다. 신용카드는 실적 문턱이 30만~50만원으로 체크보다 높은 대신, 실적을 높이면 월 한도가 올라가는 카드가 많습니다(예: 신한 K-패스는 전월 60만↑에서 월 1.5만원, 티머니 Pay&GO는 100만↑에서 월 1.8만원). 교통비가 실적에 포함되는지는 카드마다 다릅니다.',
        },
        {
          q: '신용카드가 체크카드보다 유리한 경우는?',
          a: '교통비가 많고 다른 지출로 전월실적을 쉽게 채우는 경우입니다. 연회비(2천~2만원)를 내는 대신 월 캐시백 한도가 커 더 많이 돌려받을 수 있습니다. 교통비가 적거나 실적 채우기가 부담스러우면 무연회비 체크카드 비교가 나을 수 있습니다.',
        },
      ];

const cardCompareSeo = (type: CardType): RouteSeo => {
  const label = type === 'check' ? '체크' : '신용';
  const cards = TRANSIT_CARDS.filter((c) => c.type === type && !c.discontinued).sort(
    (a, b) => cardBenefit(b, CMP_SPEND, CMP_PREV) - cardBenefit(a, CMP_SPEND, CMP_PREV),
  );
  const path = `/transit/cards/compare/${type}`;
  const url = `https://choicewise.kr${path}`;
  const kwHead =
    type === 'check'
      ? 'K패스 체크카드 비교, K-패스 체크카드, K패스 체크카드 추천, K패스 카드 비교, 케이패스 체크카드, 대중교통 체크카드'
      : 'K패스 신용카드 비교, K-패스 신용카드, K패스 신용카드 추천, K패스 카드 추천, 케이패스 신용카드, 대중교통 신용카드';
  return {
    path,
    title: `K-패스 ${label}카드 비교 — 카드사별 추가혜택·연회비 총정리 (2026)`,
    description:
      `정부 환급은 모든 K-패스 카드가 동일. 차이는 카드사 추가혜택이다. ${label}카드 ${cards.length}종을 ` +
      `추가혜택·전월실적·연회비로 한눈에 비교.`.slice(0, 150),
    keywords: kwHead,
    canonical: url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `K-패스 ${label}카드 비교`,
        description: `정부 환급 동일, 카드사 추가혜택 비교 — ${label}카드 ${cards.length}종`,
        url,
        inLanguage: 'ko-KR',
      },
      breadcrumbLd([
        { name: '홈', item: 'https://choicewise.kr/' },
        { name: 'K-패스', item: 'https://choicewise.kr/transit/cards/kpass' },
        { name: `${label}카드 비교`, item: url },
      ]),
      faqPageLd(cardCompareFaq(type)),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: cards.length,
        itemListElement: cards.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: displayName(c),
        })),
      },
    ],
  };
};

export const cardCompareSeos: RouteSeo[] = [cardCompareSeo('check'), cardCompareSeo('credit')];
