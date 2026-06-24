import { fmtMoney, pct, won2man } from '../lib/format';
import type { ComputeResult, Inputs } from '../lib/calc';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function KV({ k, v, color }: { k: string; v: string; color?: 'green' | 'blue' }) {
  return (
    <div className="flex justify-between border-b border-dashed border-border py-1.5 text-[13.5px] last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn('font-semibold', color === 'green' && 'text-fin-green', color === 'blue' && 'text-fin-blue')}>
        {v}
      </span>
    </div>
  );
}

const effBox = 'mt-3 rounded-lg bg-muted px-3 py-2.5 text-[13px] text-muted-foreground';

export function ComparePanels({ I, C }: { I: Inputs; C: ComputeResult }) {
  return (
    <>
      <h2 className="sec">3. 두 선택 비교</h2>
      <p className="mini mb-3.5">
        “만기 수령액”은 각 상품을 만기까지 채웠을 때 받는 금액(원금+정부기여금+이자, 모두 비과세)입니다.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="bg-navy2 px-[18px] py-3.5 text-[15px] font-bold text-white">
            ① 그대로 유지 — 청년도약계좌(5년)
          </div>
          <div className="p-[18px]">
            <div className="text-2xl font-extrabold tracking-tight">{fmtMoney(C.stay.total)}</div>
            <p className="mini mb-3">5년 만기 수령액 (총 {C.nStay}회 납입 가정 · 원금+기여금+이자)</p>
            <KV k={`내 납입원금 (총 ${C.nStay}회)`} v={fmtMoney(C.stay.principal)} />
            <KV k={`정부기여금 (월 ${fmtMoney(C.leapContrib)})`} v={fmtMoney(C.stay.contrib)} />
            <KV k="이자 (비과세)" v={fmtMoney(C.stay.interest)} />
            <KV k="순이익(혜택) 합계" v={fmtMoney(C.stay.benefit)} color="blue" />
            <div className={effBox}>
              연 실질효과율 <b className="text-lg text-fin-blue">{pct(C.stay.eff)}</b> · 잔여 의무기간{' '}
              <b className="text-foreground">{C.remaining}개월</b>
            </div>
          </div>
        </Card>
        <Card className="overflow-hidden p-0">
          <div className="bg-fin-green px-[18px] py-3.5 text-[15px] font-bold text-white">
            ② 전환 — 청년미래적금(3년)
          </div>
          <div className="p-[18px]">
            <div className="text-2xl font-extrabold tracking-tight text-fin-green">{fmtMoney(C.mirae.total)}</div>
            <p className="mini mb-3">
              미래적금 3년 만기 수령액 · 은행 <b>{C.bank.name}</b> (적용금리 {pct(C.rMirae)}, {C.bb.tier})
            </p>
            <KV k="내 납입원금" v={fmtMoney(C.mirae.principal)} />
            <KV k={`정부기여금 (${I.type === 'pref' ? '우대 12%' : '일반 6%'})`} v={fmtMoney(C.mirae.contrib)} />
            <KV k="이자 (비과세)" v={fmtMoney(C.mirae.interest)} />
            <KV k="순이익(혜택) 합계" v={fmtMoney(C.mirae.benefit)} color="green" />
            <div className={effBox}>
              연 실질효과율 <b className="text-lg text-fin-green">{pct(C.mirae.eff)}</b> · 의무기간{' '}
              <b className="text-foreground">36개월</b>
              <div className="mt-2 text-foreground">
                ＋ 도약계좌 해지환급금 <b>{fmtMoney(C.refund.total)}</b> 별도 수령
                <br />
                <span className="mini">
                  그동안 {C.k}회 납입분(원금 {fmtMoney(C.refund.principal)} + 기여금 {fmtMoney(C.refund.contrib)} + 이자{' '}
                  {fmtMoney(C.refund.interest)}) — 기여금·비과세 보존, 손실 0
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-3.5 rounded-[10px] border border-[#f0d9b0] bg-fin-amber-soft px-[15px] py-3.5 text-[13px] text-[#6b4310]">
        <b className="text-[#7a3b06]">공정 비교(같은 돈 기준):</b> 동일하게{' '}
        <b>월 {won2man(I.miraeMonthly)}만원을 3년간</b> 넣는다고 하면, 순이익(기여금+이자)은 미래적금{' '}
        <b>{fmtMoney(C.mirae36.benefit)}</b> vs 도약계좌 <b>{fmtMoney(C.leap36.benefit)}</b> → 미래적금이{' '}
        {C.diff3yr >= 0 ? <b>{fmtMoney(C.diff3yr)} 더 이득</b> : <b>{fmtMoney(-C.diff3yr)} 적음</b>}. 다만 ① 도약계좌는
        월 70만원까지 납입 가능(미래는 50만), ② 해지환급금은 미래적금에 일시납입이 안 돼 여유자금으로 따로 굴려야
        합니다.
      </div>
    </>
  );
}
