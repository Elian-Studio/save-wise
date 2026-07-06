import type { RouteSeo } from './head';
import { youthSavingsSeo } from '../services/youthSavings/seo';
import { transitSeo, schemeSeos } from '../services/transit/seo';

// 프리렌더 대상 라우트 목록(순서 무관). '/'(youthSavings)는 dist/index.html, 나머지는 dist/<path>/index.html.
// 홈은 청년적금 계산기(구조 A) — 별도 허브 없음. schemeSeos = /transit/cards/:id 5개.
export const ROUTE_SEO: RouteSeo[] = [youthSavingsSeo, transitSeo, ...schemeSeos];
