import type { RouteSeo } from './head';
import { youthSavingsSeo } from '../services/youthSavings/seo';
import { transitSeo } from '../services/transit/seo';

export const hubSeo: RouteSeo = {
  path: '/',
  title: 'choicewise — 청년·금융 결정 계산기 모음',
  description:
    '청년 적금 갈아타기, 교통카드, 연금까지 — 내 조건으로 가장 유리한 선택을 3분 안에 비교하는 무료 계산기 모음.',
  keywords: '금융 계산기, 갈아타기 계산기, 교통카드 추천, 연금 계산기, choicewise',
  canonical: 'https://choicewise.kr/',
  jsonLd: [],
};

// 프리렌더 대상 라우트 목록(순서 무관). '/'는 dist/index.html, 나머지는 dist/<path>/index.html.
export const ROUTE_SEO: RouteSeo[] = [hubSeo, youthSavingsSeo, transitSeo];
