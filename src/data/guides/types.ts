// 가이드(웹진) 아티클 단일 출처 타입. 서비스 상세(SchemeDetail 등)와 달리
// 계산 데이터가 아니라 장문 콘텐츠라, 본문을 구조화 문자열로만 보유한다.

export type GuideCategory = 'transit' | 'savings' | 'benefits' | 'common';
export type GuideSourceStatus = 'verified' | 'needs-review';

export interface GuideSection {
  heading: string;
  paras: string[];
  /** 라벨-값 요약 표(선택). 없으면 미렌더. */
  table?: { label: string; value: string }[];
  /** 불릿 목록(선택). */
  list?: string[];
  /** 섹션 말미 강조 CTA(선택). href는 내부 경로('/'). */
  cta?: { label: string; href: string };
}

export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  /** SEO keywords 메타(쉼표 구분). */
  keywords: string;
  category: GuideCategory;
  updatedAt: string; // YYYY-MM-DD
  readMinutes: number;
  sourceStatus: GuideSourceStatus;
  body: {
    intro: string[];
    sections: GuideSection[];
    faq: { q: string; a: string }[];
    /** 관련 서비스/문서 내부 링크. href는 '/'로 시작. */
    related: { label: string; href: string }[];
  };
}
