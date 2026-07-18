import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BANKS, NON_PARTICIPATING_NOTE } from '../../data/banks';
import { MIRAE, DATA_AS_OF } from '../../data/products';
import { bankMaxRate } from '../../lib/bankPage';
import { pct } from '../../lib/format';
import { BANKS_HUB_FAQ } from './seo';
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

        {/* 선택 가이드 산문 — 얇은 허브를 실사용 판단이 가능한 페이지로 보강 */}
        <section className="mt-11">
          <h2 className="mb-3.5 text-[19px] font-extrabold text-ink">은행, 이렇게 고르세요</h2>

          <div className="rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">먼저, 3%p 그룹과 2%p 그룹의 차이</div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              기본금리 {(MIRAE.baseRate * 100).toFixed(0)}%·36개월·비과세는 14개 은행이 똑같습니다. 최고금리를
              가르는 건 <b>기관우대 상한</b>이에요. KB국민·신한·하나·우리·NH농협·IBK기업·우체국(그룹3)은 상한이{' '}
              <b>3%p</b>라 조건을 다 채우면 명목 최고 <b>8%</b>, 수협·iM뱅크·BNK부산·광주·전북·BNK경남·카카오뱅크(그룹2)는{' '}
              <b>2%p</b>라 최고 <b>7%</b>입니다. 여기에 총급여 3,600만원 이하 소득우대 {(MIRAE.lowIncomeBonus * 100).toFixed(1)}%p와
              청년 재무상담 {(MIRAE.advisoryBonus * 100).toFixed(1)}%p가 상한 범위 안에서 더해집니다. 그룹만으로 은행을
              고르기보다, 아래 우대 3축 중 내가 실제로 채울 수 있는 게 무엇인지부터 따져야 실질금리가 보입니다.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">우대금리를 만드는 3축</div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              최고금리는 기본금리 위에 아래 세 축의 우대가 은행별 상한까지 쌓여 만들어집니다. 각 축이 실제로 무엇을
              요구하는지가 은행마다 크게 다릅니다.
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              <li className="text-[14.5px] font-medium leading-[1.65] text-foreground/90">
                <b className="text-ink">① 급여이체</b> — 그 은행 입출금 계좌로 급여를 일정 횟수·금액 이상 받으면 붙습니다.
                예를 들어 우리은행은 급여 100만원↑ 18회 이상에 +1.5%p, KB국민은 급여입금 12회 이상에 +1.0%p입니다.
                폭이 0.3~1.5%p로 넓어, 주거래 급여계좌를 어디 두느냐가 실질금리를 가장 크게 좌우합니다.
              </li>
              <li className="text-[14.5px] font-medium leading-[1.65] text-foreground/90">
                <b className="text-ink">② 카드·실적</b> — 그 은행 신용/체크카드를 월 일정액 이상 써야 합니다. KB국민은
                공과금 자동이체·KB카드 등 출금실적 12회 이상에 +0.8%p, 카카오뱅크는 체크카드 24개월·월 30만원↑에 최대
                +0.6%p입니다. 광주은행처럼 카드 실적 우대가 아예 없는 곳도 있습니다.
              </li>
              <li className="text-[14.5px] font-medium leading-[1.65] text-foreground/90">
                <b className="text-ink">③ 첫거래·도약연계</b> — 직전 6개월~1년 그 은행에 예적금이 없는 ‘첫거래’이거나
                청년도약계좌를 연계하면 붙습니다. 하나은행은 직전 1년 예적금 미보유(도약·청약 제외)면 충족돼 도약 보유자도
                받을 수 있고, 광주는 첫거래 또는 도약 연계에 +0.5%p입니다. 다만 우체국·iM뱅크·부산·경남·전북·수협·카카오는
                이 축의 우대가 없습니다.
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">‘최고금리 낚시’를 조심하세요</div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              표의 최고금리는 그 은행 우대를 <b>전부</b> 충족했을 때만 나오는 상한입니다. 급여계좌를 옮길 수 없거나
              카드 실적을 못 채우면 해당 %p는 그대로 빠져, 명목 8% 은행이 실제로는 6%대가 되기도 합니다. 그래서 ‘최고금리
              순위’가 아니라 <b>내가 실제로 채울 수 있는 우대만 반영한 실질금리</b>로 비교해야 합니다.{' '}
              <Link to="/youth-savings" className="font-extrabold text-fin-green underline underline-offset-2">
                계산기
              </Link>
              에 급여·카드·거래 조건을 넣으면 충족 가능한 우대만 더해 은행별 실질금리와 예상 수령액을 자동으로 계산해 줍니다.
              {' '}
              {NON_PARTICIPATING_NOTE}
            </p>
          </div>
        </section>

        {/* FAQ — 화면 텍스트와 banksHubSeo의 FAQPage JSON-LD가 1:1 일치 */}
        <section className="mt-10">
          <h2 className="mb-3.5 text-[19px] font-extrabold text-ink">자주 묻는 질문</h2>
          <div className="flex flex-col gap-3">
            {BANKS_HUB_FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-card p-5">
                <div className="text-[15px] font-extrabold text-ink">Q. {f.q}</div>
                <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-2.5">
          <Button asChild variant="navy" className="h-auto flex-1 py-4 text-base font-extrabold">
            <Link to="/youth-savings">내 조건으로 최적 은행 찾기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
