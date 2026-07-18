import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GUIDE_ARTICLES } from '../../data/guides';
import { ArticleCard } from '../../components/ArticleCard';

// 가이드 목록(/guide). 아티클 메타 카드 리스트.
export function GuideList() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="bg-gradient-to-br from-navy to-navy2 px-[18px] pt-14 pb-12 text-white">
        <div className="mx-auto max-w-[880px]">
          <Link
            to="/"
            className="mb-6 inline-block rounded-full bg-white/16 px-4 py-2 text-[13.5px] font-bold transition hover:bg-white/24"
          >
            ← 홈
          </Link>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-0.04em]">
            청년 돈 아끼는 가이드
          </h1>
          <p className="mt-3.5 max-w-[560px] text-[16.5px] font-medium leading-[1.55] opacity-90">
            교통카드부터 청년적금 갈아타기까지, 실제로 헷갈리는 돈 문제를 계산기와 함께 짚어 드립니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[880px] px-[18px] pt-9">
        <div className="flex flex-col gap-3.5">
          {GUIDE_ARTICLES.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
