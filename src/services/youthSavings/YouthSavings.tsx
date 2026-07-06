import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import { useCalculator } from '../../hooks/useCalculator';
import { DATA_AS_OF } from '../../data/products';
import { Wizard } from '../../components/wizard/Wizard';
import { BankRanking } from '../../components/BankRanking';
import { ScenarioTables } from '../../components/ScenarioTables';
import { InvestmentCompare } from '../../components/InvestmentCompare';
import { ProductCompare } from '../../components/ProductCompare';
import { Faq } from '../../components/Faq';
import { Sources } from '../../components/Sources';
import { Disclaimer } from '../../components/Disclaimer';
import { Ad } from '../../components/AdSlot';

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

export function YouthSavings() {
  const api = useCalculator();
  const { inputs, result, rec } = api;
  const isNew = inputs.scenario === 'new';

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
      <header className="bg-gradient-to-br from-navy to-navy2 py-6 text-white">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-[18px]">
          <h1 className="text-xl font-extrabold tracking-tight">
            {isNew ? '청년미래적금 계산기 — 신규 가입' : '청년도약계좌 ↔ 청년미래적금 갈아타기 계산기'}
          </h1>
          <div className="flex flex-wrap gap-2 text-[12.5px] font-semibold">
            <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1">기준일 {DATA_AS_OF}</span>
            {d !== null && (
              <span className="rounded-full bg-[#ffe2e2] px-2.5 py-1 text-[#a01616]">
                {d > 0 ? `신청 마감(7/3) D-${d}` : '1차 접수 마감 · 다음 12월'}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[18px] pb-20">
        {/* 1차 접수 마감 안내 — 마감일(7/3)이 지나 결정적 사실이므로 무조건 렌더(프리렌더 포함).
            근거: docs/transit-cards-research.md §5 (korea.kr 148966832, 연 2회 접수). */}
        <div className="mt-5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3.5 text-[13px] text-[#6b4310]">
          <b className="text-[#7a3b06]">청년미래적금 1차 신규 접수가 2026-07-03 마감됐어요.</b> 다음 접수는{' '}
          <b className="text-[#7a3b06]">2026년 12월 예정</b>(연 2회)입니다. 가입 예정자의 사전 비교와 기가입자의
          갈아타기·만기 계산은 계속 이용할 수 있어요.
        </div>

        {/* 메인 흐름: Switch Advisor 스텝 위저드(실엔진 구동) */}
        <Wizard api={api} />

        {/* 상세/심화 — 위저드는 요약, 아래는 전체 데이터(SEO 크롤용·기본 닫힘, DOM 유지). */}
        <Ad slot="top" />
        <details className="group mt-7">
          <summary className="disc">
            <span>은행별 적용금리 순위 자세히 보기</span>
            <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <BankRanking I={inputs} />
        </details>
        {!isNew && (
          <details className="group mt-7">
            <summary className="disc">
              <span>소득·도약 금리별 시나리오 자세히 보기</span>
              <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
                ⌄
              </span>
            </summary>
            <ScenarioTables I={inputs} />
          </details>
        )}
        <details className="group mt-7">
          <summary className="disc">
            <span>적금 vs 투자 수익 비교 자세히 보기</span>
            <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <InvestmentCompare I={inputs} C={result} />
        </details>
        <Ad slot="mid" />
        <details className="group mt-7">
          <summary className="disc">
            <span>두 상품 기본 스펙 비교 자세히 보기</span>
            <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <ProductCompare />
        </details>
        <Faq scenario={inputs.scenario} />
        <Sources />
        <Ad slot="foot" />
        <Disclaimer scenario={inputs.scenario} />
      </main>
    </>
  );
}
