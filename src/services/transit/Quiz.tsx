import type { QuizQuestion } from '../../data/transitSchemes';

type Opt = { v: string; label: string; desc?: string };

// 퀴즈 화면 — 현재 질문 1개만 렌더(key={qIndex}로 재마운트해 rise 애니메이션). 상태는 Transit이 소유.
export function Quiz({
  question,
  qIndex,
  total,
  onPick,
  onBack,
}: {
  question: QuizQuestion;
  qIndex: number;
  total: number;
  onPick: (value: string) => void;
  onBack: () => void;
}) {
  const pct = Math.round(((qIndex + 1) / total) * 100);
  const options = question.options as Opt[];
  return (
    <div className="flex flex-col items-center px-6 pt-12 pb-20">
      <div className="w-full max-w-[600px]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[14px] font-extrabold text-pp-ink">
            Q{qIndex + 1} <span className="font-semibold text-pp-muted">/ {total}</span>
          </span>
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 px-1 text-[14px] font-semibold text-pp-muted hover:text-pp-ink"
          >
            ← 이전
          </button>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mb-10 h-1.5 overflow-hidden rounded-full bg-pp-track"
        >
          <div
            className="h-full rounded-full bg-navy transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div
          key={qIndex}
          className="duration-300 ease-out animate-in fade-in slide-in-from-bottom-3 motion-reduce:animate-none"
        >
          <h2 className="text-[clamp(26px,4vw,36px)] font-extrabold leading-tight tracking-[-0.035em] text-pp-ink">
            {question.title}
          </h2>
          {question.hint && <p className="mt-2.5 text-[15px] font-medium text-pp-muted">{question.hint}</p>}
          <div className="mt-7 flex flex-col gap-2.5">
            {options.map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => onPick(opt.v)}
                className="flex min-h-11 w-full flex-col items-start gap-0.5 rounded-2xl border border-pp-line2 bg-pp-card px-[22px] py-[18px] text-left transition hover:-translate-y-px hover:border-navy"
              >
                <span className="text-[17px] font-bold text-pp-ink">{opt.label}</span>
                {opt.desc && <span className="text-[14px] font-medium text-pp-muted">{opt.desc}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
