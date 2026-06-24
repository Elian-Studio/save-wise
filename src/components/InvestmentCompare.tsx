import { breakEvenReturn, investGain } from '../lib/invest';
import type { ComputeResult, Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';

export function InvestmentCompare({ I, C }: { I: Inputs; C: ComputeResult }) {
  const n = 36;
  const m = I.miraeMonthly;
  const target = C.mirae.benefit; // 미래적금 확정 순이익(현재 은행/유형 기준)
  const invGain = investGain(m, n, I.investReturn);
  const be = breakEvenReturn(m, n, target);
  const miraeWins = invGain < target;

  return (
    <>
      <h2 className="sec">6. 적금 vs 투자 — “청미적을 할까, 투자를 할까?”</h2>
      <div className="card">
        <div className="grid cols2">
          <div>
            <div className="mini">청년미래적금 (확정 · 비과세 · 원금보장)</div>
            <div className="bignum green">{fmtMoney(target)}</div>
            <div className="mini">3년 순이익(기여금+이자) · 연 실질효과율 {pct(C.mirae.eff)}</div>
          </div>
          <div>
            <div className="mini">같은 돈을 투자 시 (가정 {pct(I.investReturn)}, 비보장)</div>
            <div className="bignum blue">{fmtMoney(invGain)}</div>
            <div className="mini">3년 기대 순이익 (원금손실 가능)</div>
          </div>
        </div>
        <div className="eff" style={{ marginTop: 14 }}>
          투자가 미래적금을 이기려면{' '}
          <b className="bignum" style={{ fontSize: 18 }}>
            연 {pct(be)}
          </b>{' '}
          이상 수익이 필요합니다. 현재 가정({pct(I.investReturn)})에서는{' '}
          {miraeWins ? (
            <b style={{ color: 'var(--green)' }}>미래적금이 유리</b>
          ) : (
            <b style={{ color: 'var(--blue)' }}>투자가 기대상 유리</b>
          )}
          .
        </div>
        <div className="note">
          <b>주의:</b> 미래적금 효과는 <b>확정·비과세·원금보장</b>이지만, 투자 수익은{' '}
          <b>가정치이며 보장되지 않고 원금손실 위험</b>이 있습니다. 무위험으로 두 자릿수 연수익률에 준하는 효과를 주는
          상품은 드뭅니다 — 안전자산 비중은 미래적금으로 채우고, 위험 감내가 가능한 여유자금만 투자로 나누는 분산이
          일반적입니다.
        </div>
      </div>
    </>
  );
}
