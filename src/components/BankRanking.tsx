import { BANKS } from '../data/banks';
import { bankRate, miraeContribMonthly, product, type Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';

export function BankRanking({ I }: { I: Inputs }) {
  const rows = BANKS.map((b) => {
    const x = bankRate(b, I);
    const p = product(I.miraeMonthly, 36, x.r, miraeContribMonthly(I.miraeMonthly, I.type));
    return { b, x, total: p.total };
  }).sort((a, b) => b.x.r - a.x.r || a.b.grp - b.b.grp);
  const bestId = rows[0]?.b.id;

  return (
    <>
      <h2 className="sec">4. 내 거래현황으로 본 은행별 적용금리 랭킹</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>은행</th>
              <th>적용금리</th>
              <th>우대 적용 근거</th>
              <th>카드 실적조건(공시)</th>
              <th>3년 만기수령</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ b, x, total }) => {
              const tag = x.tier.includes('최대') ? (
                <span className="tag s">{x.tier}</span>
              ) : x.tier.includes('카드') ? (
                <span className="tag k">{x.tier}</span>
              ) : (
                <span className="tag g">{x.tier}</span>
              );
              return (
                <tr key={b.id} className={b.id === bestId ? 'best' : undefined}>
                  <td>
                    {b.name}
                    <span className="mini"> (최고 {b.grp === 3 ? '8' : '7'}%)</span>
                    {b.id === bestId ? (
                      <>
                        {' '}
                        <span className="tag s">최적</span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    <b>{pct(x.r)}</b>
                  </td>
                  <td>{tag}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {b.cardPref != null ? `${b.cardCond} (+${(b.cardPref * 100).toFixed(1)}%p)` : <i>공시 미확인</i>}
                  </td>
                  <td>{fmtMoney(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mini" style={{ marginTop: 10 }}>
          ‘주거래 최대우대’ = 급여이체 은행 지정 + 자동이체 충족 시 그 은행의 기관 최대 우대(3%p/2%p)까지 도달 가정.
          카드 우대는 카드고릴라 공시(5개 은행) 기준이며, 항목별 세부 %p와 미공시 은행은{' '}
          <a href="https://portal.kfb.or.kr/compare/receiving_youth_future_2.php" target="_blank" rel="noopener">
            은행연합회 소비자포털
          </a>
          에서 확인하세요.
        </div>
      </div>
    </>
  );
}
