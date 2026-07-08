import { Link } from 'react-router-dom';
import { SCHEMES } from '../../data/transitSchemes';
import type { SchemeRecResult } from '../../lib/transitSchemeRec';

const byId = (id: string) => SCHEMES.find((s) => s.id === id)!;

// 결과 화면 — 정답 카드 히어로 + 근거 + 후보. rec는 Transit이 recommend()로 계산해 내려준다.
export function Result({
  rec,
  onCompare,
  onRestart,
}: {
  rec: SchemeRecResult;
  onCompare: () => void;
  onRestart: () => void;
}) {
  const top = rec.list[0];
  const w = byId(top.id);
  const runners = rec.list.slice(1, 3);
  return (
    <div className="mx-auto flex max-w-[1080px] flex-col items-center px-[18px] pt-12 pb-[140px]">
      <div className="w-full max-w-[640px] text-center">
        <div className="text-[15px] font-bold text-muted-foreground">답변 다 확인했어. 너한테는—</div>

        <div
          className="relative mt-[18px] overflow-hidden rounded-[28px] px-8 pt-10 pb-9 text-white duration-300 animate-in fade-in zoom-in-95 motion-reduce:animate-none"
          style={{ background: `linear-gradient(160deg, ${w.color}, ${w.colorDark})` }}
        >
          <div
            className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full"
            style={{ background: 'rgba(255,255,255,.1)' }}
            aria-hidden="true"
          />
          <div className="text-[14px] font-bold opacity-85">{w.tag}</div>
          <div className="mt-1.5 text-[clamp(34px,6vw,48px)] font-extrabold tracking-[-0.04em]">{w.name}</div>
          <div
            className="mt-4 inline-block rounded-full px-5 py-2.5 text-[clamp(15px,2.5vw,18px)] font-extrabold"
            style={{ background: 'rgba(255,255,255,.18)' }}
          >
            {top.savings}
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-line bg-card p-7 text-left">
          <div className="mb-3.5 text-[15px] font-extrabold text-ink">왜 이 카드냐면</div>
          <div className="flex flex-col gap-3">
            {top.reasons.map((r) => (
              <div key={r} className="flex items-start gap-2.5">
                <span
                  className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
                  style={{ background: w.color }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="text-[15.5px] font-medium leading-relaxed text-foreground/90">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mini mt-3">
          월 {rec.tripN}회 × 1,550원 기준 추정치야. 실제 환급액은 이용 패턴에 따라 달라져.
        </p>

        <div className="mt-3 flex gap-2.5">
          <Link
            to={`/transit/cards/${w.id}`}
            className="flex-1 rounded-2xl bg-navy px-4 py-[17px] text-center text-[16px] font-extrabold text-white hover:bg-navy2"
          >
            이 카드 자세히 보기
          </Link>
          <button
            type="button"
            onClick={onCompare}
            className="flex-1 rounded-2xl border border-line bg-card px-4 py-[17px] text-[16px] font-bold text-ink hover:border-navy"
          >
            전체 비교하기
          </button>
        </div>

        {runners.length > 0 && (
          <div className="mt-11 text-left">
            <div className="mb-3 text-[14px] font-extrabold text-muted-foreground">아쉽게 밀린 후보들</div>
            <div className="flex flex-col gap-2">
              {runners.map((ru) => {
                const s = byId(ru.id);
                return (
                  <Link
                    key={ru.id}
                    to={`/transit/cards/${s.id}`}
                    className="flex items-center gap-3 rounded-[14px] border border-line bg-card px-[18px] py-[15px] text-left hover:border-navy"
                  >
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ background: s.color }}
                      aria-hidden="true"
                    />
                    <span className="text-[15px] font-bold text-ink">{s.name}</span>
                    <span className="ml-auto text-[13.5px] font-medium text-muted-foreground">{ru.note}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="mt-[30px] min-h-11 text-[14px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-ink"
        >
          답 바꿔서 다시 해볼래
        </button>
      </div>
    </div>
  );
}
