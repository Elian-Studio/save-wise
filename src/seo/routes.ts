import type { RouteSeo } from './head';
import { youthSavingsSeo, banksHubSeo, bankSeos } from '../services/youthSavings/seo';
import { youthBenefitsSeo, programSeos } from '../services/youthBenefits/seo';
import { transitSeo, schemeSeos } from '../services/transit/seo';
import { aboutSeo, contactSeo } from '../services/site/seo';

// 프리렌더 대상 라우트 목록(순서 무관). '/'(transit)는 dist/index.html, 나머지는 dist/<path>/index.html.
// 홈은 패스와이즈 교통카드 추천, /youth-savings는 청년적금 계산기 서브 경로. schemeSeos = /transit/cards/:id 5개.
// aboutSeo/contactSeo = 신뢰 페이지(/about, /contact).
export const ROUTE_SEO: RouteSeo[] = [
  youthSavingsSeo,
  banksHubSeo,
  ...bankSeos,
  youthBenefitsSeo,
  ...programSeos,
  transitSeo,
  ...schemeSeos,
  aboutSeo,
  contactSeo,
];
