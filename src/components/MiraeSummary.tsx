import type { ComputeResult, Inputs } from '../lib/calc';
import { MIRAE } from '../data/products';
import { fmtMoney, pct } from '../lib/format';

// 신규 가입자용 결과 카드 — 유지/전환 verdict 없이 미래적금 만기 결과만 제시.
export function MiraeSummary({ I, C }: { I: Inputs; C: ComputeResult }) {
  const m = C.mirae;
  const years = (MIRAE.termMonths / 12).toFixed(0);
  return (
    <>
      <h2 className="sec">2. 예상 결과 — 청년미래적금 신규 가입</h2>
      <div data-testid="mirae-summary" className="rounded-xl bg-gradient-to-br from-fin-green to-[#0f6b32] p-6 text-white">
        <p className="text-[13px] opacity-85">
          {C.bb.bank.name} · 월 {fmtMoney(I.miraeMonthly)} · {years}년({MIRAE.termMonths}개월) 만기 기준
        </p>
        <p className="my-1.5 text-[26px] font-extrabold tracking-tight">만기 예상 수령액 {fmtMoney(m.total)}</p>
        <p className="text-sm opacity-95">
          원금 <b>{fmtMoney(m.principal)}</b> + 정부기여금 <b>{fmtMoney(m.contrib)}</b> + 이자 <b>{fmtMoney(m.interest)}</b>
          {' '}(비과세) · 적용금리 <b>{pct(C.rMirae)}</b> · 연 실질효과율 <b>{pct(m.eff)}</b>
        </p>
        <ul className="mt-3.5 grid gap-1.5">
          <li className="rounded-lg bg-white/15 px-3 py-2 text-[13.5px]">
            거래현황 기준 가장 유리한 은행은 <b>{C.bb.bank.name}</b>(적용금리 {pct(C.bb.r)}) — 아래 ‘추천 은행’ 참고.
          </li>
          <li className="rounded-lg bg-white/15 px-3 py-2 text-[13.5px]">
            {I.type === 'pref' ? (
              <>
                <b>우대형(정부기여금 12%)</b> 기준입니다 — 중소기업 신규취업 청년 자격. 일반형이면 기여금이 절반(6%)으로
                줄어듭니다.
              </>
            ) : (
              <>
                <b>일반형(정부기여금 6%)</b> 기준입니다 — 중소기업 신규취업 청년이면 <b>우대형(12%)</b>으로 정부기여금이
                2배가 됩니다.
              </>
            )}
          </li>
        </ul>
      </div>
    </>
  );
}
