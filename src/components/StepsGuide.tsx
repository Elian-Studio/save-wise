import type { ReactNode } from 'react';
import type { Scenario } from '../lib/calc';
import { Card, CardContent } from '@/components/ui/card';

// 미래적금 가입 공통 절차 (신규·갈아타기 동일). 갈아타기는 4번 특별중도해지가 납입 개시 앞에 삽입된다.
const applySteps: ReactNode[] = [
  <>
    <b>청년미래적금 가입 신청</b> (2026.6.22~7.3, 첫 주는 출생연도 끝자리 5부제)
  </>,
  <>
    <b>심사·가입대상 통보 확인</b> (7.6~7.24)
  </>,
  <>
    <b>청년미래적금 계좌 개설</b> (7.27~8.7)
  </>,
];

const leapCancelStep: ReactNode = (
  <>
    <b>청년도약계좌 ‘특별중도해지’ 신청</b> — 반드시 미래적금 계좌 개설 <u>후</u>
  </>
);

const payStep: ReactNode = (
  <>
    <b>청년미래적금 납입 개시</b>
  </>
);

export function StepsGuide({ scenario }: { scenario: Scenario }) {
  const isSwitch = scenario === 'switch';
  const steps = isSwitch ? [...applySteps, leapCancelStep, payStep] : [...applySteps, payStep];
  const heading = isSwitch ? '7. 갈아탄다면 — 순서를 반드시 지키세요' : '가입은 이렇게 — 신청 순서';

  return (
    <>
      <h2 className="sec">{heading}</h2>
      <Card>
        <CardContent className="pt-5">
          <ol className="grid gap-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5 text-[13.5px]">
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          {isSwitch ? (
            <div className="mt-3.5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3.5 text-[13px] text-[#6b4310]">
              <b className="text-[#7a3b06]">⚠️ 순서 주의:</b> 도약계좌를 <u>먼저</u> 해지하면 갈아타기 특례가 사라져
              정부기여금·비과세 혜택을 잃습니다. ‘특별중도해지’를 거치면 기존 납입분의 기여금·비과세가{' '}
              <b>손실 없이 환급</b>됩니다. 단 해지수령금을 미래적금에 <b>일시납입(이월)하는 것은 불가</b> — 도약계좌의
              원금·납입기간은 승계되지 않고 현금으로 돌려받습니다(신용점수 가점만 합산). 갈아타기는{' '}
              <b>2026년 6월 최초 가입기간에만</b> 가능한 일회성 기회입니다.
            </div>
          ) : (
            <div className="mt-3.5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3.5 text-[13px] text-[#6b4310]">
              <b className="text-[#7a3b06]">⚠️ 신청기간 주의:</b> 청년미래적금은 <b>2026.6.22~7.3</b> 최초 가입기간에만
              신청할 수 있습니다. 첫 주는 출생연도 끝자리 <b>5부제</b>이니 본인 신청일을 확인하세요.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
