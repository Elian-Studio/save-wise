import { stripMdLinks } from '../lib/mdlink';

// schema.org JSON-LD 공용 생성기. 각 서비스 seo.ts에 복제돼 있던 FAQPage·BreadcrumbList를 단일 출처로.

/**
 * FAQPage 구조화 데이터. mainEntity는 화면 렌더 FAQ와 1:1 일치해야 한다.
 * stripMdLinks를 무조건 적용 — 평문에는 no-op이라 가이드 외 서비스가 나중에 마크다운 링크를
 * 답변에 써도 JSON-LD엔 라벨만 남아 안전하다.
 */
export const faqPageLd = (faq: { q: string; a: string }[]): object => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: stripMdLinks(f.q),
    acceptedAnswer: { '@type': 'Answer', text: stripMdLinks(f.a) },
  })),
});

/** BreadcrumbList 구조화 데이터. position은 배열 순서로 자동 부여. */
export const breadcrumbLd = (items: { name: string; item: string }[]): object => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: it.item,
  })),
});
