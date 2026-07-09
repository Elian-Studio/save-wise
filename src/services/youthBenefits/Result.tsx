import { Link } from 'react-router-dom';
import type { Result as RecResult, BenefitItem } from '@/lib/youthBenefitRec';
import type { Cta } from '@/data/youthBenefits';
import { Button } from '@/components/ui/button';
import { ResultHero } from '@/components/patterns/ResultHero';
import { ReasonList } from '@/components/patterns/ReasonList';
import { Ad } from '@/components/AdSlot';

// 신청 CTA — 내부 서비스(계산기·진단)는 <Link>, 공식 신청은 새 탭 외부 링크.
function CtaButton({ cta, className }: { cta: Cta; className?: string }) {
  if (cta.kind === 'internal') {
    return (
      <Button asChild variant="navy" className={className}>
        <Link to={cta.to}>계산해보기 →</Link>
      </Button>
    );
  }
  return (
    <Button asChild variant="navy" className={className}>
      <a href={cta.url} target="_blank" rel="noopener noreferrer">
        공식 신청 →
      </a>
    </Button>
  );
}

const CategoryBadge = ({ children }: { children: string }) => (
  <span className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-bold text-muted-foreground">{children}</span>
);

// 자격/가능성 카드. tone='likely'면 점선 테두리 + "확인 필요" 뱃지로 eligible과 시각 구분.
function BenefitCardView({ item, tone }: { item: BenefitItem; tone: 'eligible' | 'likely' }) {
  const likely = tone === 'likely';
  return (
    <div
      className={`rounded-2xl border bg-card p-6 text-left ${likely ? 'border-dashed border-line' : 'border-line'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge>{item.category}</CategoryBadge>
        {likely && (
          <span className="rounded-full bg-fin-blue-soft px-2.5 py-1 text-[12px] font-bold text-fin-blue">
            확인 필요
          </span>
        )}
      </div>
      <h3 className="mt-2.5 text-[20px] font-extrabold tracking-[-0.02em] text-ink">{item.name}</h3>
      <div className="mt-1 text-[15px] font-bold text-navy">{item.amountLabel}</div>
      <div className="mt-4">
        <ReasonList reasons={item.reasons} variant="check" accent="var(--navy)" />
      </div>
      {item.caveat && (
        <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-[13.5px] font-medium text-muted-foreground">
          ⚠ {item.caveat}
        </p>
      )}
      <CtaButton cta={item.cta} className="mt-5 h-auto w-full py-[15px] text-[15px] font-extrabold" />
    </div>
  );
}

function GroupHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4 mt-12 text-left first:mt-0">
      <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
      <p className="mt-1 text-[14px] font-medium text-muted-foreground">{sub}</p>
    </div>
  );
}

// 결과 화면 — 받을 수 있어요 / 확인이 필요해요 / 함께 보면 좋아요 / 이미 종료된 제도 4그룹.
// rec는 컨테이너가 recommend()로 계산해 내려준다(SSG 결정적).
export function Result({ rec, onRestart }: { rec: RecResult; onRestart: () => void }) {
  const { eligible, likely, related, ended } = rec;
  const hero = eligible[0];
  const restEligible = eligible.slice(1);

  return (
    <div className="mx-auto max-w-[1080px] px-[18px] pt-12 pb-[120px]">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="text-center text-[15px] font-bold text-muted-foreground">답변을 확인했어. 네 조건이면—</div>

        {/* 받을 수 있어요 */}
        {eligible.length > 0 ? (
          <>
            <GroupHeading title="받을 수 있어요" sub="자격 조건을 대체로 충족하는 지원금이에요." />
            <ResultHero
              tone="bg-gradient-to-br from-navy to-navy2"
              deco
              animate
              className="px-7 pt-8 pb-7 text-left"
            >
              <div className="text-[13.5px] font-bold opacity-85">{hero.category}</div>
              <div className="mt-1 text-[clamp(26px,5vw,34px)] font-extrabold tracking-[-0.03em]">{hero.name}</div>
              <div className="mt-3 inline-block rounded-full bg-white/18 px-4 py-2 text-[15px] font-extrabold">
                {hero.amountLabel}
              </div>
              <ReasonList reasons={hero.reasons} variant="chip" />
              {hero.caveat && <p className="mt-3 text-[13px] font-medium opacity-85">⚠ {hero.caveat}</p>}
              <CtaButton
                cta={hero.cta}
                className="mt-5 h-auto w-full bg-white py-[15px] text-[15px] font-extrabold text-navy hover:bg-white/90"
              />
            </ResultHero>
            {restEligible.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                {restEligible.map((it) => (
                  <BenefitCardView key={it.id} item={it} tone="eligible" />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-line bg-card p-6 text-center text-[15px] font-medium text-muted-foreground">
            입력한 조건으로는 바로 받을 수 있는 지원금을 찾지 못했어요. 아래 <b className="text-ink">확인이 필요한
            제도</b>와 <b className="text-ink">함께 보면 좋은 서비스</b>를 살펴보세요.
          </div>
        )}

        {/* 확인이 필요해요 */}
        {likely.length > 0 && (
          <>
            <GroupHeading title="확인이 필요해요" sub="자격 가능성이 있지만 소득·재산·접수 일정 확인이 필요해요." />
            <div className="flex flex-col gap-4">
              {likely.map((it) => (
                <BenefitCardView key={it.id} item={it} tone="likely" />
              ))}
            </div>
          </>
        )}

        {/* 함께 보면 좋아요 */}
        <GroupHeading title="함께 보면 좋아요" sub="자격진단 밖이지만 챙기면 좋은 서비스예요." />
        <div className="flex flex-col gap-3">
          {related.map((r) => (
            <Link
              key={r.id}
              to={r.cta.kind === 'internal' ? r.cta.to : '/'}
              className="rounded-2xl border border-line bg-card p-5 text-left transition hover:border-navy"
            >
              <div className="flex items-center gap-2">
                <CategoryBadge>{r.category}</CategoryBadge>
              </div>
              <div className="mt-2 text-[17px] font-extrabold text-ink">{r.name}</div>
              <p className="mt-1 text-[14px] font-medium text-muted-foreground">{r.summary}</p>
              <span className="mt-2 inline-block text-[14px] font-bold text-navy">자세히 보기 →</span>
            </Link>
          ))}
        </div>

        {/* 이미 종료된 제도 */}
        <GroupHeading title="이미 종료된 제도" sub="신규 신청이 끝난 제도예요. 오래된 안내에 속지 마세요." />
        <div className="flex flex-col gap-2.5">
          {ended.map((e) => (
            <div key={e.id} className="rounded-xl border border-line bg-secondary/40 px-5 py-4 text-left">
              <div className="text-[15px] font-bold text-muted-foreground">{e.name}</div>
              <p className="mt-0.5 text-[13.5px] font-medium text-muted-foreground">{e.note}</p>
            </div>
          ))}
        </div>

        <p className="mini mt-6 text-center">
          이 진단은 공개된 제도 기준을 바탕으로 한 <b>참고용 추정</b>이에요. 실제 자격·지원 여부는 각 제도 운영기관에서
          꼭 확인하세요.
        </p>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onRestart}
            className="min-h-11 text-[14px] font-semibold text-muted-foreground underline underline-offset-[3px] hover:text-ink"
          >
            답 다시 하기
          </button>
        </div>

        <Ad slot="foot" />
      </div>
    </div>
  );
}
