import { fmtMoney, pct, won2man } from '../lib/format';
import type { ComputeResult, Inputs } from '../lib/calc';

function KV({ k, v, color }: { k: string; v: string; color?: 'green' | 'blue' }) {
  const style = color === 'green' ? { color: 'var(--green)' } : color === 'blue' ? { color: 'var(--blue)' } : undefined;
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v" style={style}>
        {v}
      </span>
    </div>
  );
}

export function ComparePanels({ I, C }: { I: Inputs; C: ComputeResult }) {
  return (
    <>
      <h2 className="sec">3. 두 선택 비교</h2>
      <div className="mini" style={{ margin: '-6px 0 14px' }}>
        “만기 수령액”은 각 상품을 만기까지 채웠을 때 받는 금액(원금+정부기여금+이자, 모두 비과세)입니다.
      </div>
      <div className="grid cols2">
        <div className="panel stay">
          <div className="ph">① 그대로 유지 — 청년도약계좌(5년)</div>
          <div className="pb">
            <div className="bignum">{fmtMoney(C.stay.total)}</div>
            <div className="mini" style={{ margin: '2px 0 12px' }}>
              5년 만기 수령액 (총 {C.nStay}회 납입 가정 · 원금+기여금+이자)
            </div>
            <KV k={`내 납입원금 (총 ${C.nStay}회)`} v={fmtMoney(C.stay.principal)} />
            <KV k={`정부기여금 (월 ${fmtMoney(C.leapContrib)})`} v={fmtMoney(C.stay.contrib)} />
            <KV k="이자 (비과세)" v={fmtMoney(C.stay.interest)} />
            <KV k="순이익(혜택) 합계" v={fmtMoney(C.stay.benefit)} color="blue" />
            <div className="eff">
              연 실질효과율{' '}
              <b className="bignum blue" style={{ fontSize: 18 }}>
                {pct(C.stay.eff)}
              </b>{' '}
              · 잔여 의무기간 <b>{C.remaining}개월</b>
            </div>
          </div>
        </div>
        <div className="panel switch">
          <div className="ph">② 전환 — 청년미래적금(3년)</div>
          <div className="pb">
            <div className="bignum green">{fmtMoney(C.mirae.total)}</div>
            <div className="mini" style={{ margin: '2px 0 12px' }}>
              미래적금 3년 만기 수령액 · 은행 <b>{C.bank.name}</b> (적용금리 {pct(C.rMirae)}, {C.bb.tier})
            </div>
            <KV k="내 납입원금" v={fmtMoney(C.mirae.principal)} />
            <KV k={`정부기여금 (${I.type === 'pref' ? '우대 12%' : '일반 6%'})`} v={fmtMoney(C.mirae.contrib)} />
            <KV k="이자 (비과세)" v={fmtMoney(C.mirae.interest)} />
            <KV k="순이익(혜택) 합계" v={fmtMoney(C.mirae.benefit)} color="green" />
            <div className="eff">
              연 실질효과율{' '}
              <b className="bignum green" style={{ fontSize: 18 }}>
                {pct(C.mirae.eff)}
              </b>{' '}
              · 의무기간 <b>36개월</b>
              <div style={{ marginTop: 8, color: 'var(--ink)' }}>
                ＋ 도약계좌 해지환급금 <b>{fmtMoney(C.refund.total)}</b> 별도 수령
                <br />
                <span className="mini">
                  그동안 {C.k}회 납입분(원금 {fmtMoney(C.refund.principal)} + 기여금 {fmtMoney(C.refund.contrib)} + 이자{' '}
                  {fmtMoney(C.refund.interest)}) — 기여금·비과세 보존, 손실 0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="note">
        <b>공정 비교(같은 돈 기준):</b> 동일하게 <b>월 {won2man(I.miraeMonthly)}만원을 3년간</b> 넣는다고 하면,
        순이익(기여금+이자)은 미래적금 <b>{fmtMoney(C.mirae36.benefit)}</b> vs 도약계좌{' '}
        <b>{fmtMoney(C.leap36.benefit)}</b> → 미래적금이{' '}
        {C.diff3yr >= 0 ? <b>{fmtMoney(C.diff3yr)} 더 이득</b> : <b>{fmtMoney(-C.diff3yr)} 적음</b>}. 다만 ① 도약계좌는
        월 70만원까지 납입 가능(미래는 50만), ② 해지환급금은 미래적금에 일시납입이 안 돼 여유자금으로 따로 굴려야
        합니다.
      </div>
    </>
  );
}
