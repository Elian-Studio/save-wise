import { useEffect, useRef } from 'react';
import { track } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import { useCalculator } from './hooks/useCalculator';
import { DATA_AS_OF } from './data/products';
import { InputsPanel } from './components/InputsPanel';
import { VerdictCard } from './components/VerdictCard';
import { DecisionTable } from './components/DecisionTable';
import { BankPick } from './components/BankPick';
import { ComparePanels } from './components/ComparePanels';
import { BankRanking } from './components/BankRanking';
import { ScenarioTables } from './components/ScenarioTables';
import { InvestmentCompare } from './components/InvestmentCompare';
import { StepsGuide } from './components/StepsGuide';
import { ProductCompare } from './components/ProductCompare';
import { Sources } from './components/Sources';
import { Disclaimer } from './components/Disclaimer';
import { Ad } from './components/AdSlot';

function ddayTo(date: string): number {
  const dead = new Date(`${date}T23:59:59+09:00`).getTime();
  return Math.ceil((dead - Date.now()) / 86_400_000);
}

// 소득을 원시값 대신 구간으로 (집계 용이·민감도 완화). 도약/미래 소득경계 기준.
function salaryBand(man: number): string {
  if (man <= 2400) return '≤2400';
  if (man <= 3600) return '2400-3600';
  if (man <= 4800) return '3600-4800';
  if (man <= 6000) return '4800-6000';
  if (man <= 7500) return '6000-7500';
  return '7500+';
}

export default function App() {
  const api = useCalculator();
  const { inputs, result, rec } = api;
  const d = ddayTo('2026-07-03');

  // 추천 결과 기록 (Vercel Analytics 커스텀 이벤트).
  // ponytail: 라이브 계산이라 1.5s 디바운스 + 동일 결과 중복제거 — 타이핑 중 폭주 방지.
  const lastTracked = useRef('');
  useEffect(() => {
    const key = `${rec.verdict}|${result.bb.bank.id}|${inputs.type}|${inputs.goal}|${salaryBand(inputs.salary)}`;
    const t = setTimeout(() => {
      if (key === lastTracked.current) return;
      lastTracked.current = key;
      track('recommend', {
        verdict: rec.verdict, // switch / stay / close
        bank: result.bb.bank.id, // 추천 1위 은행
        type: inputs.type, // gen / pref
        goal: inputs.goal, // amount / liquid
        salaryBand: salaryBand(inputs.salary),
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [rec.verdict, result.bb.bank.id, inputs.type, inputs.goal, inputs.salary]);

  return (
    <>
      <header className="bg-gradient-to-br from-navy to-navy2 py-7 text-white">
        <div className="mx-auto max-w-[1080px] px-[18px]">
          <h1 className="text-2xl font-extrabold tracking-tight">청년도약계좌 ↔ 청년미래적금 갈아타기 계산기</h1>
          <p className="mt-2 text-sm text-[#c7d2e4]">
            내 상황과 거래은행을 넣으면 <b>유지/전환</b> 결론과 <b>나에게 가장 유리한 은행</b>을 찾아줍니다.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2 text-[12.5px] font-semibold">
            <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1">기준일 {DATA_AS_OF}</span>
            <span className="rounded-full bg-[#ffe2e2] px-2.5 py-1 text-[#a01616]">
              {d > 0 ? `신청 마감(7/3) D-${d}` : '청년미래적금 신청기간 종료'}
            </span>
            <span className="rounded-full bg-[#16a34a] px-2.5 py-1">출처: 금융위·은행연합회·카드고릴라</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-[18px] pb-20">
        <InputsPanel api={api} />
        <VerdictCard C={result} rec={rec} />
        <DecisionTable rec={rec} />
        <BankPick I={inputs} C={result} />
        <ComparePanels I={inputs} C={result} />
        <Ad slot="top" />
        <BankRanking I={inputs} />
        <ScenarioTables I={inputs} />
        <InvestmentCompare I={inputs} C={result} />
        <Ad slot="mid" />
        <StepsGuide />
        <ProductCompare />
        <Sources />
        <Ad slot="foot" />
        <Disclaimer />
      </main>
      <Analytics />
    </>
  );
}
