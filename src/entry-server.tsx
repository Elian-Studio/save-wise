/* eslint-disable react-refresh/only-export-components -- 빌드 타임 SSR 엔트리(HMR 무관). 프리렌더가 render+ROUTE_SEO+renderHead를 단일 번들에서 가져다 쓴다. */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppRoutes } from './router';

// 빌드 타임 프리렌더용. scripts/prerender.mjs가 경로별로 render(url)을 호출해 dist/<route>/index.html의 #root에 주입.
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
}

// 프리렌더 스크립트(Node)가 SSR 번들에서 함께 가져다 쓴다.
export { ROUTE_SEO } from './seo/routes';
export { renderHead } from './seo/head';
