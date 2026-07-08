import { Link } from 'react-router-dom';
import { SCHEMES } from '../../data/transitSchemes';

// 비교 화면 — 5개 제도를 가로 스크롤 카드로. SEO를 위해 전 제도·전 행을 항상 렌더.
export function Compare({ onQuiz, onHome }: { onQuiz: () => void; onHome: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1080px] px-[18px] pt-12 pb-[90px]">
      <button
        type="button"
        onClick={onHome}
        className="mb-5 min-h-11 text-[14px] font-semibold text-muted-foreground hover:text-ink"
      >
        ← 홈으로
      </button>
      <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.04em] text-ink">
        다섯 장, 한눈에 비교
      </h2>
      <p className="mt-2.5 mb-7 text-[16px] font-medium text-muted-foreground">
        핵심만 추렸어. 궁금한 카드는 눌러서 자세히 봐.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {SCHEMES.map((s) => (
          <div
            key={s.id}
            className="flex min-w-[224px] flex-1 flex-col overflow-hidden rounded-[20px] border border-line bg-card"
          >
            <div
              className="px-[18px] pt-[18px] pb-4 text-white"
              style={{ background: `linear-gradient(160deg, ${s.color}, ${s.colorDark})` }}
            >
              <div className="text-[12.5px] font-bold opacity-85">{s.tag}</div>
              <div className="mt-0.5 text-[19px] font-extrabold tracking-[-0.02em]">{s.name}</div>
            </div>
            <div className="flex flex-1 flex-col gap-[13px] px-[18px] py-4">
              {s.compareRows.map((row) => (
                <div key={row.k}>
                  <div className="mb-[3px] text-[11.5px] font-extrabold tracking-wide text-muted-foreground">{row.k}</div>
                  <div className="text-[14px] font-semibold leading-snug text-foreground/90">{row.v}</div>
                </div>
              ))}
            </div>
            <Link
              to={`/transit/cards/${s.id}`}
              className="mx-[18px] mb-[18px] rounded-xl bg-secondary px-3 py-3 text-center text-[14px] font-extrabold text-ink hover:bg-navy hover:text-white"
            >
              자세히 보기
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3.5 rounded-[18px] bg-navy px-6 py-5 text-white">
        <div className="text-[16px] font-bold">표 봐도 모르겠으면, 그냥 나한테 맡겨.</div>
        <button
          type="button"
          onClick={onQuiz}
          className="rounded-full bg-white px-6 py-3 text-[15px] font-extrabold text-navy hover:-translate-y-0.5"
        >
          30초 추천받기 →
        </button>
      </div>
    </div>
  );
}
