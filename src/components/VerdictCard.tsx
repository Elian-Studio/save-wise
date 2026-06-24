import type { ComputeResult, Recommendation } from '../lib/calc';
import { fmtMoney } from '../lib/format';
import { cn } from '@/lib/utils';

const grad: Record<Recommendation['verdict'], string> = {
  switch: 'from-fin-green to-[#0f6b32]',
  stay: 'from-[#1d4ed8] to-[#1739a8]',
  close: 'from-fin-amber to-[#92420a]',
};

export function VerdictCard({ C, rec }: { C: ComputeResult; rec: Recommendation }) {
  return (
    <>
      <h2 className="sec">2. 결론 — 유지할까, 갈아탈까</h2>
      <div data-testid="verdict" className={cn('rounded-xl bg-gradient-to-br p-6 text-white', grad[rec.verdict])}>
        <p className="text-[13px] opacity-85">내 상황 기준 추천</p>
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
      </div>
    </>
  );
}
