import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BANKS, NON_PARTICIPATING_NOTE } from '../../data/banks';
import { MIRAE, DATA_AS_OF } from '../../data/products';
import { bankMaxRate } from '../../lib/bankPage';
import { pct } from '../../lib/format';
import { Button } from '@/components/ui/button';

const pp = (x: number | null) => (x != null && x > 0 ? `+${(x * 100).toFixed(1)}%p` : '—');

// 최고금리 desc, 동률이면 grp3 우선.
const ranked = [...BANKS].sort((a, b) => bankMaxRate(b) - bankMaxRate(a) || a.grp - b.grp);

export function BanksHub() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="bg-navy px-[18px] pt-12 pb-11 text-white">
        <div className="mx-auto max-w-[1080px]">
          <Link
            to="/youth-savings"
            className="mb-6 inline-block rounded-full bg-white/15 px-4 py-2 text-[13.5px] font-bold transition hover:bg-white/25"
          >
            ← 계산기로
          </Link>
          <h1 className="text-[clamp(30px,4.6vw,46px)] font-extrabold tracking-[-0.04em]">
            청년미래적금 은행별 금리·우대조건 비교 (2026)
          </h1>
          <p className="mt-3.5 max-w-[620px] text-[16px] font-medium leading-[1.55] opacity-90">
            참여 14개 은행의 “조건 모두 충족 시 최고금리”와 우대 항목을 한 표로. 기본금리 5%·36개월·비과세는 전 기관
            공통이고, 급여이체·카드·도약연계·출시 우대의 합을 기관 상한(그룹3 8% / 그룹2 7%)까지 더해 최고금리가
            결정됩니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] font-bold">
            <span className="rounded-full bg-white/15 px-3 py-1.5">🟢 정본 · 은행연합회 소비자포털</span>
            <span className="rounded-full bg-white/15 px-3 py-1.5">기준일 {DATA_AS_OF}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-[18px] pt-9">
        <div className="mb-6 rounded-2xl border border-line bg-card p-5">
          <div className="text-[14px] font-extrabold text-ink">공통 조건</div>
          <p className="mt-1.5 text-[13.5px] font-medium leading-[1.6] text-muted-foreground">
            전 기관 기본금리 {(MIRAE.baseRate * 100).toFixed(0)}%·36개월·비과세이며, 공통우대(총급여 3,600만원 이하{' '}
            {pp(MIRAE.lowIncomeBonus)} · 청년 재무상담 {pp(MIRAE.advisoryBonus)})가 더해집니다. {NON_PARTICIPATING_NOTE}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-line text-[12.5px] font-bold text-muted-foreground">
                <th className="p-3.5">은행</th>
                <th className="p-3.5 text-right whitespace-nowrap">최고금리</th>
                <th className="p-3.5 text-right whitespace-nowrap">기관상한</th>
                <th className="p-3.5 text-right whitespace-nowrap">급여</th>
                <th className="p-3.5 text-right whitespace-nowrap">카드</th>
                <th className="p-3.5 text-right whitespace-nowrap">도약연계</th>
                <th className="p-3.5 text-right whitespace-nowrap">출시</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0 hover:bg-secondary">
                  <td className="p-3.5 whitespace-nowrap">
                    <Link to={`/youth-savings/banks/${b.id}`} className="font-extrabold text-ink hover:underline">
                      {b.name} →
                    </Link>
                  </td>
                  <td className="p-3.5 text-right text-[15px] font-extrabold whitespace-nowrap text-fin-green">
                    {pct(bankMaxRate(b))}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap text-muted-foreground">
                    {b.grp === 3 ? '8%' : '7%'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap text-muted-foreground">{pp(b.salaryPref)}</td>
                  <td className="p-3.5 text-right whitespace-nowrap text-muted-foreground">{pp(b.cardPref)}</td>
                  <td className="p-3.5 text-right whitespace-nowrap text-muted-foreground">{pp(b.switchPref)}</td>
                  <td className="p-3.5 text-right whitespace-nowrap text-muted-foreground">{pp(b.launchBonus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12.5px] font-medium leading-[1.5] text-muted-foreground">
          최고금리 = 기본 5% + (급여·카드·도약연계·출시 + 공통우대) 합을 기관 상한까지 적용한 값. 항목별 %p·충족조건은 은행별
          상세 페이지에서 공시 원문으로 확인하세요.
        </p>

        <div className="mt-10 flex flex-wrap gap-2.5">
          <Button asChild variant="navy" className="h-auto flex-1 py-4 text-base font-extrabold">
            <Link to="/youth-savings">내 조건으로 최적 은행 찾기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
