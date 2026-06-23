import { fmtMoney } from '../lib/format';
import type { ComputeResult, Recommendation } from '../lib/calc';

export function VerdictCard({ C, rec }: { C: ComputeResult; rec: Recommendation }) {
  return (
    <>
      <h2 className="sec">2. 결론 — 유지할까, 갈아탈까</h2>
      <div className={`verdict ${rec.verdict}`}>
        <p className="vlabel">내 상황 기준 추천</p>
        <p className="vmain">{rec.main}</p>
        <p className="vsum">
          유지 시 만기수령 <b>{fmtMoney(C.stay.total)}</b> · 전환 시 미래적금 만기 <b>{fmtMoney(C.mirae.total)}</b>(
          {C.bank.name}) + 도약 환급 <b>{fmtMoney(C.refund.total)}</b>
        </p>
        <ul className="reasons">
          {rec.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
