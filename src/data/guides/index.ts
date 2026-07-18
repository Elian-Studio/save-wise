import type { GuideArticle } from './types';
import { cheongdogyeVsCheongmijeok } from './cheongdogye-vs-cheongmijeok';
import { moduuiCard } from './moduui-card';

export type { GuideArticle, GuideCategory, GuideSection } from './types';

// 가이드 아티클 단일 출처. updatedAt 내림차순 정렬(최신 우선).
export const GUIDE_ARTICLES: GuideArticle[] = [cheongdogyeVsCheongmijeok, moduuiCard].sort(
  (a, b) => b.updatedAt.localeCompare(a.updatedAt),
);

export const getGuide = (slug: string): GuideArticle | undefined =>
  GUIDE_ARTICLES.find((g) => g.slug === slug);

export const GUIDE_CATEGORY_LABEL: Record<GuideArticle['category'], string> = {
  transit: '교통카드',
  savings: '청년적금',
  benefits: '청년혜택',
  common: '공통',
};
