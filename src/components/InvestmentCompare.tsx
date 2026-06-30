import { breakEvenReturn, investGain } from '../lib/invest';
import type { ComputeResult, Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';
import { Card, CardContent } from '@/components/ui/card';

export function InvestmentCompare({ I, C }: { I: Inputs; C: ComputeResult }) {
  const n = 36;
  const m = I.miraeMonthly;
  const target = C.mirae.benefit;
  const invGain = investGain(m, n, I.investReturn);
  const be = breakEvenReturn(m, n, target);
  const miraeWins = invGain < target;

  return (
    <>
      <h2 className="sec">적금 vs 투자 — “미래적금을 할까, 투자를 할까?”</h2>
      <Card>
        <CardContent className="pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mini">청년미래적금 (확정 · 비과세 · 원금보장)</p>
              <div className="text-2xl font-extrabold text-fin-green">{fmtMoney(target)}</div>
              <p className="mini">3년 순이익(기여금+이자) · 연 실질효과율 {pct(C.mirae.eff)}</p>
            </div>
            <div>
              <p className="mini">같은 돈을 투자 시 (가정 {pct(I.investReturn)}, 비보장)</p>
              <div className="text-2xl font-extrabold text-fin-blue">{fmtMoney(invGain)}</div>
              <p className="mini">3년 기대 순이익 (원금손실 가능)</p>
            </div>
          </div>
          <div className="mt-3.5 rounded-lg bg-muted px-3 py-2.5 text-[13px] text-muted-foreground">
            투자가 미래적금을 이기려면 <b className="text-lg text-foreground">연 {pct(be)}</b> 이상 수익이 필요합니다.
            현재 가정({pct(I.investReturn)})에서는{' '}
            {miraeWins ? (
              <b className="text-fin-green">미래적금이 유리</b>
            ) : (
              <b className="text-fin-blue">투자가 기대상 유리</b>
            )}
            .
          </div>
          <div className="mt-3.5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3.5 text-[13px] text-[#6b4310]">
            <b className="text-[#7a3b06]">주의:</b> 미래적금 효과는 <b>확정·비과세·원금보장</b>이지만, 투자 수익은{' '}
            <b>가정치이며 보장되지 않고 원금손실 위험</b>이 있습니다. 무위험으로 두 자릿수 연수익률에 준하는 효과를 주는
            상품은 드뭅니다 — 안전자산 비중은 미래적금으로 채우고, 위험 감내가 가능한 여유자금만 투자로 나누는 분산이
            일반적입니다.
          </div>
        </CardContent>
      </Card>
    </>
  );
}
