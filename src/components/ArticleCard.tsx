import { Link } from 'react-router-dom';
import { GUIDE_ARTICLES, GUIDE_CATEGORY_LABEL } from '../data/guides';

type Article = (typeof GUIDE_ARTICLES)[number];

// 가이드 아티클 카드 공용 컴포넌트. GuideList(/guide)와 Transit 홈 스트립이 공유한다.
// titleAs: 목록 맥락에 맞춰 제목 헤딩 레벨만 바꾼다(GuideList h2, 홈 스트립 h3). 크기·스타일은 단일.
export function ArticleCard({
  article,
  titleAs: Title = 'h2',
}: {
  article: Article;
  titleAs?: 'h2' | 'h3';
}) {
  return (
    <Link
      to={`/guide/${article.slug}`}
      className="rounded-2xl border border-line bg-card p-5.5 transition hover:-translate-y-px hover:border-navy"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-fin-blue-soft px-2.5 py-1 text-[12.5px] font-extrabold text-fin-blue">
          {GUIDE_CATEGORY_LABEL[article.category]}
        </span>
        <span className="text-[13px] font-semibold text-muted-foreground">
          {article.updatedAt} · {article.readMinutes}분 읽기
        </span>
      </div>
      <Title className="mt-2.5 text-[19px] font-extrabold leading-[1.35] tracking-[-0.02em] text-ink">
        {article.title}
      </Title>
      <p className="mt-2 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">
        {article.description}
      </p>
    </Link>
  );
}
