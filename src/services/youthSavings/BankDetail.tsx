import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BANKS, getBank, NON_PARTICIPATING_NOTE, type Bank } from '../../data/banks';
import { MIRAE, DATA_AS_OF, SOURCES } from '../../data/products';
import { bankMaxRate, bankEstimate, bankPrefLines } from '../../lib/bankPage';
import { fmtMoney, pct } from '../../lib/format';
import { Button } from '@/components/ui/button';

const pp = (x: number) => `+${(x * 100).toFixed(1)}%p`;

// 같은 그룹 우선, 최고금리 높은 순으로 관련 은행 3곳(자기 제외).
function relatedBanks(bank: Bank): Bank[] {
  return BANKS.filter((b) => b.id !== bank.id)
    .sort((a, b) => Number(b.grp === bank.grp) - Number(a.grp === bank.grp) || bankMaxRate(b) - bankMaxRate(a))
    .slice(0, 3);
}

export function BankDetail() {
  const { id } = useParams<{ id: string }>();
  const bank = id ? getBank(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!bank) return <Navigate to="/youth-savings/banks" replace />;

  const maxRate = bankMaxRate(bank);
  const groupMax = bank.grp === 3 ? 0.03 : 0.02;
  const ceilPct = bank.grp === 3 ? '8' : '7';
  const lines = bankPrefLines(bank);
  const gen = bankEstimate(bank, 'gen');
  const pref = bankEstimate(bank, 'pref');
  const related = relatedBanks(bank);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 히어로 — 전 은행 공통 네이비 표면(금융 톤 통일) */}
      <section className="bg-navy px-[18px] pt-12 pb-11 text-white">
        <div className="mx-auto max-w-[1080px]">
          <Link
            to="/youth-savings/banks"
            className="mb-6 inline-block rounded-full bg-white/15 px-4 py-2 text-[13.5px] font-bold transition hover:bg-white/25"
          >
            ← 은행별 비교로
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-[15px] font-bold opacity-85">청년미래적금 · 2026</div>
              <h1 className="mt-1 text-[clamp(32px,5vw,50px)] font-extrabold tracking-[-0.04em]">
                {bank.name} 청년미래적금
              </h1>
              <p className="mt-3.5 max-w-[560px] text-[16px] font-medium leading-[1.55] opacity-90">
                우대조건 모두 충족 시 <b>최고 연 {pct(maxRate)}</b> · 기본금리 5%·36개월·비과세.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] font-bold">
                <span className="rounded-full bg-white/15 px-3 py-1.5">기관상한 최고 {ceilPct}% (그룹{bank.grp})</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">🟢 정본 · 은행연합회 소비자포털</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">기준일 {DATA_AS_OF}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/12 px-6 py-4.5 text-right">
              <div className="text-[13px] font-bold opacity-80">조건 모두 충족 최고금리</div>
              <div className="mt-0.5 text-[36px] font-extrabold tracking-[-0.02em]">{pct(maxRate)}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-[18px] pt-9">
        {/* 브레드크럼 */}
        <nav className="mb-6 text-[13px] font-semibold text-muted-foreground" aria-label="breadcrumb">
          <Link to="/youth-savings" className="hover:underline">
            홈
          </Link>{' '}
          ›{' '}
          <Link to="/youth-savings/banks" className="hover:underline">
            미래적금 은행
          </Link>{' '}
          › <span className="text-ink">{bank.name}</span>
        </nav>

        {/* 우대금리 구성 표 — 이 페이지의 고유 콘텐츠 */}
        <h2 className="mb-1 text-[17px] font-extrabold text-ink">{bank.name} 우대금리 구성</h2>
        <p className="mb-4 text-[14px] font-medium leading-[1.5] text-muted-foreground">
          은행연합회 소비자포털 비교공시 정본({DATA_AS_OF}) 기준. 총 우대는 기관 상한(그룹{bank.grp} {(
            groupMax * 100
          ).toFixed(0)}
          %p)으로 캡되므로 아래 항목의 단순 합은 최고금리(연 {pct(maxRate)})보다 클 수 있습니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-[14.5px]">
            <thead>
              <tr className="border-b border-line text-[13px] font-bold text-muted-foreground">
                <th className="p-4">항목</th>
                <th className="p-4 text-right whitespace-nowrap">우대폭</th>
                <th className="p-4">충족조건(공시 원문)</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.label} className="border-b border-line last:border-0">
                  <td className="p-4 font-extrabold text-ink whitespace-nowrap">{l.label}</td>
                  <td className="p-4 text-right font-bold whitespace-nowrap text-fin-green">
                    {l.label === '기본금리' ? pct(l.pp) : pp(l.pp)}
                  </td>
                  <td className="p-4 font-medium leading-[1.5] text-muted-foreground">{l.cond}</td>
                </tr>
              ))}
              <tr className="bg-fin-green-soft">
                <td className="p-4 font-extrabold text-ink whitespace-nowrap">조건 충족 최고금리</td>
                <td className="p-4 text-right text-[17px] font-extrabold whitespace-nowrap text-fin-green">
                  연 {pct(maxRate)}
                </td>
                <td className="p-4 font-medium leading-[1.5] text-muted-foreground">
                  기관 상한 {(groupMax * 100).toFixed(0)}%p 적용 후
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {bank.marketingReq && (
          <p className="mt-3 text-[13px] font-medium text-fin-amber">
            ⚠ {bank.name}은 일부 우대에 마케팅 수신 동의가 전제됩니다.
          </p>
        )}

        {/* 예상 수령액 */}
        <h2 className="mt-11 mb-1 text-[17px] font-extrabold text-ink">예상 수령액 (월 50만·36개월)</h2>
        <p className="mb-4 text-[14px] font-medium leading-[1.5] text-muted-foreground">
          최고금리 연 {pct(maxRate)} 적용, 매월 한도(50만원)를 36개월 자유적립·단리·비과세로 가정한 예시입니다.
          정부기여금 유형(일반형 {(MIRAE.contribGen * 100).toFixed(0)}% / 우대형 {(MIRAE.contribPref * 100).toFixed(0)}%)에
          따라 수령액이 달라집니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-[14.5px]">
            <thead>
              <tr className="border-b border-line text-[13px] font-bold text-muted-foreground">
                <th className="p-4">정부기여금 유형</th>
                <th className="p-4 text-right whitespace-nowrap">원금</th>
                <th className="p-4 text-right whitespace-nowrap">정부기여금</th>
                <th className="p-4 text-right whitespace-nowrap">이자</th>
                <th className="p-4 text-right whitespace-nowrap">총수령</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: `일반형 (${(MIRAE.contribGen * 100).toFixed(0)}%)`, r: gen },
                { label: `우대형 (${(MIRAE.contribPref * 100).toFixed(0)}%)`, r: pref },
              ].map(({ label, r }) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="p-4 font-extrabold text-ink whitespace-nowrap">{label}</td>
                  <td className="p-4 text-right font-medium whitespace-nowrap text-muted-foreground">
                    {fmtMoney(r.principal)}
                  </td>
                  <td className="p-4 text-right font-semibold whitespace-nowrap text-fin-green">{fmtMoney(r.contrib)}</td>
                  <td className="p-4 text-right font-semibold whitespace-nowrap text-fin-green">{fmtMoney(r.interest)}</td>
                  <td className="p-4 text-right text-[16px] font-extrabold whitespace-nowrap text-ink">
                    {fmtMoney(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] font-medium leading-[1.5] text-muted-foreground">
          우대형은 중소기업 신규취업자 등 자격 요건이 있습니다. 실제 금리·수령액은 가입 시점 우대 충족 여부와 은행 공시에
          따라 달라질 수 있어요.
        </p>

        {/* 도약계좌 보유자라면 */}
        <div className="mt-11 rounded-2xl border border-line bg-fin-green-soft p-5.5">
          <div className="text-base font-extrabold text-ink">청년도약계좌 보유자라면</div>
          <p className="mt-1.5 text-[14.5px] font-medium leading-[1.6] text-foreground/90">
            {bank.switchPref != null
              ? `${bank.name}은 도약계좌 연계가입 우대(${pp(bank.switchPref)})가 있어 갈아타기 시 유리할 수 있어요. `
              : `${bank.name}은 도약 연계 우대는 없지만, 내 소득·잔여기간에 따라 갈아타기가 유리할 수 있어요. `}
            내 소득·거래은행·도약 잔여기간을 넣으면 유지 vs 전환을 계산해 드립니다.
          </p>
          <Button asChild variant="navy" className="mt-4 h-auto px-5 py-3 text-sm font-extrabold">
            <Link to="/youth-savings">갈아타기 계산기 열기 →</Link>
          </Button>
        </div>

        {/* 관련 은행 */}
        <h2 className="mt-11 mb-3.5 text-[17px] font-extrabold text-ink">관련 은행 비교</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {related.map((b) => (
            <Link
              key={b.id}
              to={`/youth-savings/banks/${b.id}`}
              className="rounded-2xl border border-line bg-card p-5 transition hover:border-navy"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15.5px] font-extrabold text-ink">{b.name}</span>
                <span className="text-[18px] font-extrabold text-fin-green">{pct(bankMaxRate(b))}</span>
              </div>
              <div className="mt-1 text-[12.5px] font-medium text-muted-foreground">
                최고 {b.grp === 3 ? '8' : '7'}% · 그룹{b.grp}
              </div>
            </Link>
          ))}
        </div>

        {/* 출처 */}
        <div className="mt-11 rounded-2xl border border-line bg-card p-5">
          <div className="text-[14px] font-extrabold text-ink">출처</div>
          <a
            href={SOURCES[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-block text-[13.5px] font-semibold text-primary hover:underline"
          >
            {SOURCES[0].label} →
          </a>
          <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">
            기준일 {DATA_AS_OF}. {NON_PARTICIPATING_NOTE} 가입 전 은행 공시를 반드시 재확인하세요.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          <Button asChild variant="navy" className="h-auto flex-1 py-4 text-base font-extrabold">
            <Link to="/youth-savings">내 조건으로 계산하기</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-1 py-4 text-base font-bold text-ink">
            <Link to="/youth-savings/banks">14개 은행 비교</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
