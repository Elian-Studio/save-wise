import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { SCHEMES, type Scheme, type SchemePick } from '../../data/transitSchemes';
import { TRANSIT_CARDS } from '../../data/transitCards';
import { SCHEME_GUIDES } from '../../data/transitSchemeGuides';
import { Button } from '@/components/ui/button';

// 픽을 화면 표시용으로 정규화. 카드형은 TRANSIT_CARDS에서 표시명/신청링크를 파생한다.
function resolvePick(pick: SchemePick): {
  name: string;
  tag: string;
  desc: string;
  best?: string;
  applyUrl?: string;
} {
  if (pick.kind === 'card') {
    const card = TRANSIT_CARDS.find((c) => c.id === pick.cardId);
    // '신한 K-패스 신한카드' 같은 발급사 중복 방지 — name에 이미 있으면 접두어 생략
    const display = card ? (card.name.includes(card.issuer) ? card.name : `${card.issuer} ${card.name}`) : pick.cardId;
    return {
      name: display,
      tag: pick.tag,
      desc: pick.desc,
      best: pick.best,
      applyUrl: card?.applyUrl,
    };
  }
  return { name: pick.name, tag: pick.tag, desc: pick.desc, best: pick.best, applyUrl: pick.url };
}

export function SchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const scheme = SCHEMES.find((s): s is Scheme => s.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!scheme) return <Navigate to="/" replace />;

  const tint = `${scheme.color}1f`;
  const guide = SCHEME_GUIDES[scheme.id];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 히어로: 브랜드 그라디언트 위 흰 본문(대비 확보) */}
      <section
        className="px-[18px] pt-12 pb-11 text-white"
        style={{ background: `linear-gradient(160deg, ${scheme.color}, ${scheme.colorDark})` }}
      >
        <div className="mx-auto max-w-[1080px]">
          <Link
            to="/"
            className="mb-6 inline-block rounded-full px-4 py-2 text-[13.5px] font-bold transition hover:brightness-110"
            style={{ background: 'rgba(255,255,255,.16)' }}
          >
            ← 돌아가기
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-[15px] font-bold opacity-85">{scheme.tag}</div>
              <h1 className="mt-1 text-[clamp(34px,5.5vw,54px)] font-extrabold tracking-[-0.04em]">
                {scheme.name}
              </h1>
              <p className="mt-3.5 max-w-[520px] text-[16.5px] font-medium leading-[1.55] opacity-90">
                {scheme.summary}
              </p>
            </div>
            <div
              className="rounded-2xl px-6 py-4.5 text-right"
              style={{ background: 'rgba(255,255,255,.14)' }}
            >
              <div className="text-[13px] font-bold opacity-80">{scheme.priceLabel}</div>
              <div className="mt-0.5 text-[26px] font-extrabold tracking-[-0.02em]">
                {scheme.price}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-[18px] pt-9">
        {/* 종료 예정 안내 배너 — endNotice 있는 제도(기후동행)만 */}
        {scheme.endNotice && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <div className="text-[15px] font-extrabold">⚠ 충전 종료 안내</div>
            <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6]">{scheme.endNotice}</div>
          </div>
        )}

        {/* 이런 사람 칩 */}
        <div className="flex flex-wrap gap-2">
          {scheme.fit.map((f) => (
            <span
              key={f}
              className="rounded-full border border-line bg-card px-4 py-2.5 text-sm font-bold text-foreground/90"
            >
              {f}
            </span>
          ))}
        </div>

        {/* 혜택 그리드 */}
        <div
          className="mt-8 grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}
        >
          {scheme.benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-card p-5.5">
              <div className="text-base font-extrabold text-ink">{b.title}</div>
              <div className="mt-1.5 text-[14.5px] font-medium leading-[1.55] text-muted-foreground">
                {b.desc}
              </div>
            </div>
          ))}
        </div>

        {/* 발급 카드/방식 픽 */}
        <div className="mt-9">
          <div className="mb-1 text-[17px] font-extrabold text-ink">{scheme.pick.title}</div>
          <div className="mb-4 text-[14.5px] font-medium leading-[1.5] text-muted-foreground">
            {scheme.pick.hint}
          </div>
          <div className="flex flex-col gap-2.5">
            {scheme.picks.map((raw, i) => {
              const p = resolvePick(raw);
              return (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[16.5px] font-extrabold text-ink">{p.name}</span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[12.5px] font-extrabold"
                        style={{ background: tint, color: scheme.colorDark }}
                      >
                        {p.tag}
                      </span>
                    </div>
                    <div className="mt-2 text-[14.5px] font-medium leading-[1.55] text-muted-foreground">
                      {p.desc}
                    </div>
                    {p.applyUrl && (
                      <a
                        href={p.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-extrabold underline underline-offset-2"
                        style={{ color: scheme.colorDark }}
                      >
                        신청하러 가기 →
                      </a>
                    )}
                  </div>
                  {p.best && (
                    <div
                      className="min-w-[88px] flex-shrink-0 rounded-xl px-3.5 py-2.5 text-center"
                      style={{ background: tint }}
                    >
                      <div
                        className="text-[11px] font-extrabold tracking-[0.04em] opacity-70"
                        style={{ color: scheme.colorDark }}
                      >
                        이런 사람
                      </div>
                      <div
                        className="mt-0.5 text-[13.5px] font-extrabold leading-[1.3]"
                        style={{ color: scheme.colorDark }}
                      >
                        {p.best}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 발급 스텝 */}
        <div className="mt-9">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">발급은 이렇게</div>
          <div className="flex flex-col">
            {scheme.steps.map((step, i) => (
              <div
                key={step}
                className="flex items-start gap-3.5 border-b border-line py-3.5"
              >
                <span
                  className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
                  style={{ background: scheme.color }}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[15px] font-semibold leading-[1.5] text-foreground/90">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 심층 가이드 — 누가/신청 상세/계산 예시/주의/FAQ */}
        <div className="mt-11">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">{guide.eligibility.heading}</div>
          <div className="flex flex-col gap-3">
            {guide.eligibility.paras.map((p) => (
              <p key={p} className="text-[15px] font-medium leading-[1.65] text-foreground/90">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">신청, 자세히 보면</div>
          <div className="flex flex-col">
            {guide.applyDetail.map((s, i) => (
              <div key={s.step} className="flex items-start gap-3.5 border-b border-line py-3.5">
                <span
                  className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
                  style={{ background: scheme.color }}
                >
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <div className="text-[15px] font-extrabold text-ink">{s.step}</div>
                  <div className="mt-1 text-[14.5px] font-medium leading-[1.55] text-muted-foreground">
                    {s.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-9">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">얼마나 돌려받을까</div>
          <div className="rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">{guide.calcExample.title}</div>
            <div className="mt-3.5 flex flex-col">
              {guide.calcExample.rows.map((r, i) => (
                <div
                  key={r.label}
                  className={`flex items-center justify-between gap-4 py-2.5 ${
                    i < guide.calcExample.rows.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="text-[14.5px] font-medium text-muted-foreground">{r.label}</span>
                  <span
                    className={`flex-shrink-0 text-right font-extrabold ${
                      i === guide.calcExample.rows.length - 1
                        ? 'text-[17px]'
                        : 'text-[15px] text-foreground/90'
                    }`}
                    style={i === guide.calcExample.rows.length - 1 ? { color: scheme.colorDark } : undefined}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3.5 text-[13px] font-medium leading-[1.5] text-muted-foreground">
              {guide.calcExample.note}
            </div>
          </div>
        </div>

        <div className="mt-9">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">주의할 점</div>
          <ul className="flex flex-col gap-2.5">
            {guide.cautions.map((c) => (
              <li key={c} className="flex items-start gap-2.5">
                <span
                  className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: scheme.color }}
                  aria-hidden="true"
                />
                <span className="text-[14.5px] font-medium leading-[1.55] text-foreground/90">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-9">
          <div className="mb-3.5 text-[17px] font-extrabold text-ink">자주 묻는 질문</div>
          <div className="flex flex-col gap-3">
            {guide.faq.map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-card p-5">
                <div className="text-[15px] font-extrabold text-ink">Q. {f.q}</div>
                <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="mt-10 flex gap-2.5">
          <Button asChild variant="navy" className="h-auto flex-1 py-4 text-base font-extrabold">
            <Link to="/?s=quiz">나한테 맞는지 확인하기</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-1 py-4 text-base font-bold text-ink">
            <Link to="/?s=compare">다른 카드랑 비교</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
