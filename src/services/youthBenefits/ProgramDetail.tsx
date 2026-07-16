import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BENEFITS, type BenefitId } from '@/data/youthBenefits';
import { BENEFIT_GUIDES } from '@/data/youthBenefitGuides';
import { Button } from '@/components/ui/button';

const isBenefitId = (id: string | undefined): id is BenefitId =>
  BENEFITS.some((b) => b.id === id);

// 제도별 상세 — 조건·신청방법 검색 실수요 조준. transit SchemeDetail 구조 미러.
// 히어로는 다크에서도 흰 글자 대비가 유지되는 navy 그라디언트(ResultHero와 동일 팔레트).
export function ProgramDetail() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!isBenefitId(id)) return <Navigate to="/youth-benefits" replace />;

  const benefit = BENEFITS.find((b) => b.id === id)!;
  const guide = BENEFIT_GUIDES[id];
  const notice = benefit.caveat ?? guide.notice;
  const applyUrl = benefit.cta.kind === 'apply' ? benefit.cta.url : undefined;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 히어로: navy 그라디언트 위 흰 본문(라이트·다크 모두 대비 유지) */}
      <section className="bg-gradient-to-br from-navy to-navy2 px-[18px] pt-12 pb-11 text-white">
        <div className="mx-auto max-w-[1080px]">
          <Link
            to="/youth-benefits"
            className="mb-6 inline-block rounded-full bg-white/16 px-4 py-2 text-[13.5px] font-bold transition hover:bg-white/24"
          >
            ← 자격진단으로
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-[15px] font-bold opacity-85">{benefit.category}</div>
              <h1 className="mt-1 text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-0.04em]">
                {benefit.name}
              </h1>
              <p className="mt-3.5 max-w-[560px] text-[16.5px] font-medium leading-[1.55] opacity-90">
                {benefit.summary}
              </p>
            </div>
            <div className="rounded-2xl bg-white/14 px-6 py-4.5 text-right">
              <div className="text-[13px] font-bold opacity-80">지원 규모</div>
              <div className="mt-1 text-[19px] font-extrabold leading-[1.35] tracking-[-0.02em]">
                {benefit.amountLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-[18px] pt-9">
        {/* 마감/안내 배너 — 마감된 제도(wolse·niljeo)만 */}
        {notice && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <div className="text-[15px] font-extrabold">⚠ 신청 안내</div>
            <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6]">{notice}</div>
          </div>
        )}

        {/* 정의 블록 — AI 검색 인용 대상(자기완결 한 문단). 히어로 요약과 별개로 사실 정의를 명확히 노출. */}
        {guide.definition && (
          <p className="mb-6 rounded-2xl border-l-4 border-navy bg-muted/40 px-5 py-4 text-[15.5px] font-semibold leading-[1.65] text-ink">
            {guide.definition}
          </p>
        )}

        {/* 핵심 요약 표 — '조건/자격' 검색의 추출 단위. */}
        {guide.specs && (
          <div className="mb-9">
            <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">한눈에 보는 핵심 요건</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14.5px]">
                <tbody>
                  {guide.specs.map((s) => (
                    <tr key={s.label} className="border-b border-line">
                      <th
                        scope="row"
                        className="w-[34%] py-3 pr-4 text-left align-top font-extrabold text-ink"
                      >
                        {s.label}
                      </th>
                      <td className="py-3 align-top font-medium leading-[1.55] text-foreground/90">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 누가 받을 수 있나 */}
        <div className="mt-2">
          <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">{guide.eligibility.heading}</h2>
          <div className="flex flex-col gap-3">
            {guide.eligibility.paras.map((p) => (
              <p key={p} className="text-[15px] font-medium leading-[1.65] text-foreground/90">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* 신청, 자세히 */}
        <div className="mt-9">
          <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">신청, 자세히 보면</h2>
          <div className="flex flex-col">
            {guide.applyDetail.map((s, i) => (
              <div key={s.step} className="flex items-start gap-3.5 border-b border-line py-3.5">
                <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-extrabold text-white">
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

        {/* 주의할 점 */}
        <div className="mt-9">
          <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">주의할 점</h2>
          <ul className="flex flex-col gap-2.5">
            {guide.cautions.map((c) => (
              <li key={c} className="flex items-start gap-2.5">
                <span
                  className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-navy"
                  aria-hidden="true"
                />
                <span className="text-[14.5px] font-medium leading-[1.55] text-foreground/90">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-9">
          <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">자주 묻는 질문</h2>
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

        {/* 출처 */}
        <p className="mt-8 text-[12.5px] font-medium leading-[1.55] text-muted-foreground">
          출처: {benefit.source}
        </p>

        {/* 하단 CTA */}
        <div className="mt-6 flex gap-2.5">
          {applyUrl && (
            <Button asChild variant="navy" className="h-auto flex-1 py-4 text-base font-extrabold">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                공식 신청 →
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="h-auto flex-1 py-4 text-base font-bold text-ink">
            <Link to="/youth-benefits">내 자격 30초 진단 →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
