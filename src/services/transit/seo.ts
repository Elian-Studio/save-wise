import type { RouteSeo } from '../../seo/head';
import { SCHEMES } from '../../data/transitSchemes';
import { SCHEME_GUIDES, HOME_FAQ } from '../../data/transitSchemeGuides';
import { TRANSIT_CARDS, type CardType, type TransitCard } from '../../data/transitCards';
import { cardBenefit } from '../../lib/cardCompare';

// 가시 렌더 FAQ와 동일 Q&A를 FAQPage 구조화 데이터로. mainEntity가 화면 콘텐츠와 일치해야 함.
const faqPageLd = (faq: { q: string; a: string }[]): object => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

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
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://choicewise.kr/' },
          { '@type': 'ListItem', position: 2, name: s.name, item: url },
        ],
      },
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
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: 'https://choicewise.kr/' },
          { '@type': 'ListItem', position: 2, name: 'K-패스', item: 'https://choicewise.kr/transit/cards/kpass' },
          { '@type': 'ListItem', position: 3, name: `${label}카드 비교`, item: url },
        ],
      },
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
