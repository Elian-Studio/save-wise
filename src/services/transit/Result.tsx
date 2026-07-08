import { Link } from 'react-router-dom';
import { SCHEMES } from '../../data/transitSchemes';
import type { SchemeRecResult } from '../../lib/transitSchemeRec';
import { Button } from '@/components/ui/button';
import { ResultHero } from '@/components/patterns/ResultHero';
import { ReasonList } from '@/components/patterns/ReasonList';

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

        <ResultHero
          style={{ background: `linear-gradient(160deg, ${w.color}, ${w.colorDark})` }}
          deco
          animate
          className="mt-[18px] px-8 pt-10 pb-9 text-center"
        >
          <div className="text-[14px] font-bold opacity-85">{w.tag}</div>
          <div className="mt-1.5 text-[clamp(34px,6vw,48px)] font-extrabold tracking-[-0.04em]">{w.name}</div>
          <div
            className="mt-4 inline-block rounded-full px-5 py-2.5 text-[clamp(15px,2.5vw,18px)] font-extrabold"
            style={{ background: 'rgba(255,255,255,.18)' }}
          >
            {top.savings}
          </div>
        </ResultHero>

        <div className="mt-6 rounded-2xl border border-line bg-card p-7 text-left">
          <div className="mb-3.5 text-[15px] font-extrabold text-ink">왜 이 카드냐면</div>
          <ReasonList reasons={top.reasons} variant="check" accent={w.color} />
        </div>

        <p className="mini mt-3">
          월 {rec.tripN}회 × 1,550원 기준 추정치야. 실제 환급액은 이용 패턴에 따라 달라져.
        </p>

        <div className="mt-3 flex gap-2.5">
          <Button asChild variant="navy" className="h-auto flex-1 py-[17px] text-[16px] font-extrabold">
            <Link to={`/transit/cards/${w.id}`}>이 카드 자세히 보기</Link>
          </Button>
          <Button
            variant="outline"
            onClick={onCompare}
            className="h-auto flex-1 py-[17px] text-[16px] font-bold text-ink"
          >
            전체 비교하기
          </Button>
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
                    className="flex items-center gap-3 rounded-xl border border-line bg-card px-[18px] py-[15px] text-left hover:border-navy"
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
