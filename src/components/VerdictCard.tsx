import type { ComputeResult, Recommendation } from '../lib/calc';
import { fmtMoney } from '../lib/format';
import { cn } from '@/lib/utils';

const grad: Record<Recommendation['verdict'], string> = {
  switch: 'from-fin-green to-[#0f6b32]',
  stay: 'from-[#1d4ed8] to-[#1739a8]',
  close: 'from-fin-amber to-[#92420a]',
};

export function VerdictCard({ C, rec, dday }: { C: ComputeResult; rec: Recommendation; dday?: number | null }) {
  // 'stay'를 제외한 결론(전환·접전)은 사용자가 도약을 해지할 수 있는 위험군 → 순서 경고 노출.
  const showOrderWarn = rec.verdict !== 'stay';
  return (
    <>
      <h2 className="sec">2. 결론 — 유지할까, 갈아탈까</h2>
      <div data-testid="verdict" className={cn('rounded-xl bg-gradient-to-br p-6 text-white', grad[rec.verdict])}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] opacity-85">내 상황 기준 추천</p>
          {dday != null && dday > 0 && (
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold whitespace-nowrap">
              📅 신청 마감 D-{dday}
            </span>
          )}
        </div>
        <p data-testid="verdict-main" className="my-1.5 text-[26px] font-extrabold tracking-tight">
          {rec.main}
        </p>
        <p className="text-sm opacity-95">
          유지 시 만기수령 <b>{fmtMoney(C.stay.total)}</b> · 전환 시 미래적금 만기 <b>{fmtMoney(C.mirae.total)}</b>(
          {C.bank.name}) + 도약 환급 <b>{fmtMoney(C.refund.total)}</b>
        </p>
        <ul className="mt-3.5 grid gap-1.5">
          {rec.reasons.map((r, i) => (
            <li key={i} className="rounded-lg bg-white/15 px-3 py-2 text-[13.5px]">
              {r}
            </li>
          ))}
        </ul>
        {showOrderWarn && (
          <div
            data-testid="verdict-order-warn"
            className="mt-3.5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3 text-[13px] text-[#6b4310]"
          >
            <b className="text-[#7a3b06]">⚠️ 순서 주의:</b> 갈아탈 땐 <b>미래적금 계좌 개설 후</b> 도약계좌를 해지하세요. 도약을
            먼저 해지하면 정부기여금·비과세 혜택이 사라집니다. (자세한 순서는 아래 ‘7. 갈아탄다면’ 참고)
          </div>
        )}
      </div>
    </>
  );
}
