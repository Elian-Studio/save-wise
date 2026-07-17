import { useEffect, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getGuide, GUIDE_CATEGORY_LABEL } from '../../data/guides';
import { Button } from '@/components/ui/button';

// 본문 문자열 안의 마크다운 링크 [라벨](href)를 실제 링크로 렌더. '/'로 시작하면 내부(Link), 그 외 외부(a).
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const linkCls = 'font-semibold text-fin-blue underline underline-offset-2 hover:opacity-80';
function renderRich(text: string): ReactNode {
  const parts = text.split(LINK_RE); // [텍스트, 라벨, href, 텍스트, 라벨, href, ...]
  if (parts.length === 1) return text;
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    const label = parts[i + 1];
    const href = parts[i + 2];
    if (label == null || href == null) continue;
    out.push(
      href.startsWith('/') ? (
        <Link key={i} to={href} className={linkCls}>
          {label}
        </Link>
      ) : (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {label}
        </a>
      ),
    );
  }
  return out;
}

// 가이드 아티클 상세(/guide/:slug). SchemeDetail/ProgramDetail의 섹션 마크업·토큰을 그대로 따른다.
export function GuideArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getGuide(slug ?? '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) return <Navigate to="/guide" replace />;

  const { body } = article;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 히어로: navy 그라디언트 위 흰 본문(라이트·다크 모두 대비 유지) */}
      <section className="bg-gradient-to-br from-navy to-navy2 px-[18px] pt-12 pb-11 text-white">
        <div className="mx-auto max-w-[820px]">
          <Link
            to="/guide"
            className="mb-6 inline-block rounded-full bg-white/16 px-4 py-2 text-[13.5px] font-bold transition hover:bg-white/24"
          >
            ← 가이드 목록
          </Link>
          <h1 className="text-[clamp(28px,4.5vw,44px)] font-extrabold leading-[1.2] tracking-[-0.035em]">
            {article.title}
          </h1>
          <div className="mt-4 text-[13.5px] font-semibold opacity-80">
            {GUIDE_CATEGORY_LABEL[article.category]} · {article.updatedAt} · {article.readMinutes}분 읽기
          </div>
          <div className="mt-2 text-[13px] font-medium opacity-75">
            choicewise 편집팀 ·{' '}
            <Link to="/about" className="underline underline-offset-2 hover:opacity-100">
              데이터 출처·검증 정책
            </Link>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-[820px] px-[18px] pt-9">
        {/* 인트로 */}
        <div className="flex flex-col gap-3.5">
          {body.intro.map((p) => (
            <p key={p} className="text-[16px] font-medium leading-[1.75] text-foreground/90">
              {renderRich(p)}
            </p>
          ))}
        </div>

        {/* 섹션 */}
        {body.sections.map((s) => (
          <section key={s.heading} className="mt-11">
            <h2 className="mb-3.5 text-[clamp(20px,3vw,26px)] font-extrabold tracking-[-0.03em] text-ink">
              {s.heading}
            </h2>
            <div className="flex flex-col gap-3.5">
              {s.paras.map((p) => (
                <p key={p} className="text-[15.5px] font-medium leading-[1.75] text-foreground/90">
                  {renderRich(p)}
                </p>
              ))}
            </div>

            {s.table && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-[14.5px]">
                  <caption className="sr-only">{s.heading} 요약</caption>
                  <tbody>
                    {s.table.map((row) => (
                      <tr key={row.label} className="border-b border-line">
                        <th
                          scope="row"
                          className="w-[38%] py-3 pr-4 text-left align-top font-extrabold text-ink"
                        >
                          {row.label}
                        </th>
                        <td className="py-3 align-top font-medium leading-[1.55] text-foreground/90">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {s.list && (
              <ul className="mt-4 flex flex-col gap-2.5">
                {s.list.map((li) => (
                  <li key={li} className="flex items-start gap-2.5">
                    <span
                      className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-navy dark:bg-white/40"
                      aria-hidden="true"
                    />
                    <span className="text-[15px] font-medium leading-[1.65] text-foreground/90">
                      {renderRich(li)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {s.cta && (
              <Button
                asChild
                variant="navy"
                className="mt-6 h-auto w-full py-4 text-base font-extrabold sm:w-auto sm:px-8"
              >
                <Link to={s.cta.href}>{s.cta.label}</Link>
              </Button>
            )}
          </section>
        ))}

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-3.5 text-[clamp(20px,3vw,26px)] font-extrabold tracking-[-0.03em] text-ink">
            자주 묻는 질문
          </h2>
          <div className="flex flex-col gap-3">
            {body.faq.map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-card p-5">
                <div className="text-[15px] font-extrabold text-ink">Q. {f.q}</div>
                <div className="mt-1.5 text-[14.5px] font-medium leading-[1.65] text-muted-foreground">
                  {renderRich(f.a)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 관련 서비스/문서 */}
        <section className="mt-11">
          <h2 className="mb-3.5 text-[17px] font-extrabold text-ink">이어서 해보기</h2>
          <div className="flex flex-col gap-2.5">
            {body.related.map((r) => (
              <Button
                key={r.href}
                asChild
                variant="outline"
                className="h-auto justify-start py-4 text-[15px] font-bold text-ink"
              >
                <Link to={r.href}>{r.label} →</Link>
              </Button>
            ))}
          </div>
        </section>

        {article.sourceStatus === 'needs-review' && (
          <p className="mt-8 text-[12.5px] font-medium leading-[1.55] text-muted-foreground">
            일부 수치는 확인 중입니다. 최종 결정 전 공식 채널에서 다시 확인하세요.
          </p>
        )}
      </article>
    </div>
  );
}
