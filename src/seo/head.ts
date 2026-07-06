// 라우트별 SEO 메타. 프리렌더(scripts/prerender.mjs)가 </head> 직전에 renderHead() 결과를 삽입한다.
// og:image·og:type·twitter:card 등 전 라우트 공통값은 index.html에 정적 유지.

// 속성값에 들어가는 <, >, &, " 이스케이프(메타 content·JSON-LD 안전).
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface RouteSeo {
  /** 라우트 경로. '/'는 dist/index.html, '/foo'는 dist/foo/index.html로 프리렌더 */
  path: string;
  title: string;
  description: string;
  keywords: string;
  /** 절대 canonical URL */
  canonical: string;
  /** 이 라우트에 주입할 JSON-LD 객체들 (WebApplication·FAQPage 등). 전역 WebSite/Organization은 index.html에 정적. */
  jsonLd: object[];
}

export function renderHead(seo: RouteSeo): string {
  const ld = seo.jsonLd
    // </script> 조기 종료·스크립트 인젝션 방지: < 를 유니코드 이스케이프.
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="keywords" content="${esc(seo.keywords)}" />`,
    `<link rel="canonical" href="${esc(seo.canonical)}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(seo.canonical)}" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    ld,
  ].join('\n    ');
}
