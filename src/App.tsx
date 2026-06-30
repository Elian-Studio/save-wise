import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { Analytics } from '@vercel/analytics/react';
import { useCalculator } from './hooks/useCalculator';
import { DATA_AS_OF } from './data/products';
import { fmtMoney, pct } from './lib/format';
import { InputsPanel } from './components/InputsPanel';
import { MiraeSummary } from './components/MiraeSummary';
import { ShareButton } from './components/ShareButton';
import { VerdictCard } from './components/VerdictCard';
import { DecisionTable } from './components/DecisionTable';
import { BankPick } from './components/BankPick';
import { ComparePanels } from './components/ComparePanels';
import { BankRanking } from './components/BankRanking';
import { ScenarioTables } from './components/ScenarioTables';
import { InvestmentCompare } from './components/InvestmentCompare';
import { StepsGuide } from './components/StepsGuide';
import { ProductCompare } from './components/ProductCompare';
import { Faq } from './components/Faq';
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
  const { inputs, result, rec, setInput, leapStart } = api;
  const isNew = inputs.scenario === 'new';

  // 공유 텍스트 — 결과 요약(받는 사람이 클릭하도록)
  const shareSummary = isNew
    ? `청년미래적금 예상 만기수령액 ${fmtMoney(result.mirae.total)} · 추천 ${result.bb.bank.name} ${pct(result.rMirae)} (내 조건 기준)`
    : `${rec.main} · 유지 ${fmtMoney(result.stay.total)} vs 미래적금 ${fmtMoney(result.mirae.total)}`;

  // ponytail: D-day만 클라 계산 — Date.now() 기반이라 프리렌더(빌드시각)와 불일치.
  // 나머지 화면은 결정적이라 프리렌더 마크업과 그대로 일치한다.
  const [d, setD] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 1회 클라 전용값(D-day), 의도된 단일 추가 렌더
  useEffect(() => setD(ddayTo('2026-07-03')), []);

  // 추천 결과 기록 (Vercel Analytics 커스텀 이벤트).
  // ponytail: 라이브 계산이라 1.5s 디바운스 + 동일 결과 중복제거 — 타이핑 중 폭주 방지.
  const lastTracked = useRef('');
  useEffect(() => {
    // 신규 모드엔 유지/전환 verdict가 없음 → 'new'로 기록.
    const verdict = isNew ? 'new' : rec.verdict;
    const key = `${verdict}|${result.bb.bank.id}|${inputs.type}|${inputs.goal}|${salaryBand(inputs.salary)}`;
    const t = setTimeout(() => {
      if (key === lastTracked.current) return;
      lastTracked.current = key;
      track('recommend', {
        scenario: inputs.scenario, // new / switch
        verdict, // new / switch / stay / close
        bank: result.bb.bank.id, // 추천 1위 은행
        type: inputs.type, // gen / pref
        goal: inputs.goal, // amount / liquid
        salaryBand: salaryBand(inputs.salary),
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [isNew, rec.verdict, result.bb.bank.id, inputs.type, inputs.goal, inputs.salary, inputs.scenario]);

  return (
    <>
      <header className="bg-gradient-to-br from-navy to-navy2 py-7 text-white">
        <div className="mx-auto max-w-[1080px] px-[18px]">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isNew ? '청년미래적금 계산기 — 신규 가입' : '청년도약계좌 ↔ 청년미래적금 갈아타기 계산기'}
          </h1>
          <p className="mt-2 text-sm text-[#c7d2e4]">
            {isNew ? (
              <>
                내 거래은행을 넣으면 <b>미래적금 예상 수령액</b>과 <b>나에게 가장 유리한 은행</b>을 찾아줍니다.
              </>
            ) : (
              <>
                내 상황과 거래은행을 넣으면 <b>유지/전환</b> 결론과 <b>나에게 가장 유리한 은행</b>을 찾아줍니다.
              </>
            )}
          </p>
          {/* 페이지 전체를 재구성하는 모드 전환 → tabpanel이 아니므로 aria-pressed 토글 버튼이 정직한 시맨틱 */}
          <div
            role="group"
            aria-label="계산 모드"
            className="mt-3.5 inline-flex rounded-full bg-white/10 p-1 text-[13px] font-bold"
          >
            <button
              type="button"
              aria-pressed={isNew}
              onClick={() => setInput('scenario', 'new')}
              className={`rounded-full px-3.5 py-1.5 transition ${isNew ? 'bg-white text-navy' : 'text-white/80'}`}
            >
              신규 가입
            </button>
            <button
              type="button"
              aria-pressed={!isNew}
              onClick={() => setInput('scenario', 'switch')}
              className={`rounded-full px-3.5 py-1.5 transition ${!isNew ? 'bg-white text-navy' : 'text-white/80'}`}
            >
              갈아타기(도약 보유자)
            </button>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2 text-[12.5px] font-semibold">
            <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1">기준일 {DATA_AS_OF}</span>
            {d !== null && (
              <span className="rounded-full bg-[#ffe2e2] px-2.5 py-1 text-[#a01616]">
                {d > 0 ? `신청 마감(7/3) D-${d}` : '청년미래적금 신청기간 종료'}
              </span>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-[18px] pb-20">
        <InputsPanel api={api} />
        {isNew ? (
          <>
            <MiraeSummary I={inputs} C={result} />
            <ShareButton state={{ inputs, leapStart }} summary={shareSummary} />
            <StepsGuide scenario={inputs.scenario} />
          </>
        ) : (
          <>
            <VerdictCard C={result} rec={rec} dday={d} />
            <DecisionTable rec={rec} />
            <ShareButton state={{ inputs, leapStart }} summary={shareSummary} />
          </>
        )}
        <BankPick I={inputs} C={result} />
        {!isNew && <ComparePanels I={inputs} C={result} />}
        <Ad slot="top" />
        <BankRanking I={inputs} />
        {!isNew && <ScenarioTables I={inputs} />}
        <InvestmentCompare I={inputs} C={result} />
        <Ad slot="mid" />
        {!isNew && <StepsGuide scenario={inputs.scenario} />}
        <ProductCompare />
        <Faq scenario={inputs.scenario} />
        <Sources />
        <Ad slot="foot" />
        <Disclaimer scenario={inputs.scenario} />
      </main>
      <Analytics />
    </>
  );
}
