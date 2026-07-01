// 라우트별 SEO 메타. 프리렌더(scripts/prerender.mjs)가 index.html의 <!--route-head--> 자리에
// renderHead() 결과를 주입한다. og:image·og:type·twitter:card 등 전 라우트 공통값은 index.html에 정적 유지.

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
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n    ');
  return [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}" />`,
    `<meta name="keywords" content="${seo.keywords}" />`,
    `<link rel="canonical" href="${seo.canonical}" />`,
    `<meta property="og:title" content="${seo.title}" />`,
    `<meta property="og:description" content="${seo.description}" />`,
    `<meta property="og:url" content="${seo.canonical}" />`,
    `<meta name="twitter:title" content="${seo.title}" />`,
    `<meta name="twitter:description" content="${seo.description}" />`,
    ld,
  ].join('\n    ');
}
