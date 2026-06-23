import { compute, recommend, type Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';

function recTag(score: number) {
  if (score >= 1) return <span className="tag s">전환</span>;
  if (score <= -1) return <span className="tag k">유지</span>;
  return <span className="tag c">접전</span>;
}

const TYPES: ReadonlyArray<readonly ['gen' | 'pref', string]> = [
  ['gen', '일반형 (6%)'],
  ['pref', '우대형 (12%)'],
];

export function ScenarioTables({ I }: { I: Inputs }) {
  const incomes = [2000, 3000, 4200, 5400, 6500];
  const elapses = [6, 18, 30, 42, 54];
  return (
    <>
      <h2 className="sec">5. 시나리오별 결론 (변수 하나씩 바꿔보기)</h2>
      <div className="grid cols2">
        <div className="card">
          <p className="card-title">소득구간별</p>
          <table>
            <thead>
              <tr>
                <th>총급여(만원)</th>
                <th>도약 월기여금</th>
                <th>3년 순이익 차액</th>
                <th>추천</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((s) => {
                const J = { ...I, salary: s };
                const C = compute(J);
                const R = recommend(J, C);
                return (
                  <tr key={s}>
                    <td>{s.toLocaleString()}</td>
                    <td>{fmtMoney(C.leapContrib)}</td>
                    <td>
                      {C.diff3yr >= 0 ? '+' : ''}
                      {fmtMoney(C.diff3yr)}
                    </td>
                    <td>{recTag(R.score)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mini" style={{ marginTop: 8 }}>
            유형·거래현황 고정. 차액 = 같은 월납입 3년 기준 (미래적금 − 도약).
          </div>
        </div>
        <div className="card">
          <p className="card-title">도약계좌 경과기간별</p>
          <table>
            <thead>
              <tr>
                <th>경과(개월)</th>
                <th>잔여</th>
                <th>해지환급금</th>
                <th>추천</th>
              </tr>
            </thead>
            <tbody>
              {elapses.map((e) => {
                const J = { ...I, elapsed: e, paidCount: e };
                const C = compute(J);
                const R = recommend(J, C);
                return (
                  <tr key={e} className={e === I.elapsed ? 'me' : undefined}>
                    <td>{e}</td>
                    <td>{60 - e}</td>
                    <td>{fmtMoney(C.refund.total)}</td>
                    <td>{recTag(R.score)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mini" style={{ marginTop: 8 }}>
            만기 임박일수록 ‘마무리 유지’ 신호가 강해집니다.
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title">유형별 (일반형 6% vs 우대형 12%)</p>
        <table>
          <thead>
            <tr>
              <th>유형</th>
              <th>미래 적용금리</th>
              <th>미래 연 실질효과율</th>
              <th>3년 순이익 차액</th>
              <th>추천</th>
            </tr>
          </thead>
          <tbody>
            {TYPES.map(([t, label]) => {
              const J = { ...I, type: t };
              const C = compute(J);
              const R = recommend(J, C);
              return (
                <tr key={t} className={t === I.type ? 'me' : undefined}>
                  <td>{label}</td>
                  <td>{pct(C.rMirae)}</td>
                  <td>{pct(C.mirae.eff)}</td>
                  <td>
                    {C.diff3yr >= 0 ? '+' : ''}
                    {fmtMoney(C.diff3yr)}
                  </td>
                  <td>{recTag(R.score)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
