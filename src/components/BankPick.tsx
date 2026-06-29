import type { ReactNode } from 'react';
import { BANKS } from '../data/banks';
import { bankRate, type ComputeResult, type Inputs } from '../lib/calc';
import { MIRAE } from '../data/products';
import { pct } from '../lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Crit({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 text-[13.5px]">
      <span className="h-fit shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-bold text-navy">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function BankPick({ I, C }: { I: Inputs; C: ComputeResult }) {
  const ranked = BANKS.map((b) => ({ b, r: bankRate(b, I).r })).sort((a, b) => b.r - a.r);
  const rank = ranked.findIndex((x) => x.b.id === C.bb.bank.id) + 1;
  const groupMax = C.bb.bank.grp === 3 ? 0.03 : 0.02;
  const manualDiff = I.bankMode === 'manual' && C.bank.id !== C.bb.bank.id;

  const isNew = I.scenario === 'new';
  return (
    <>
      <h2 className="sec">{isNew ? '추천 은행과 선정 기준' : '전환한다면 — 추천 은행과 선정 기준'}</h2>
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm text-muted-foreground">내 거래현황 기준 추천 은행</span>
            <span className="text-2xl font-extrabold text-fin-green">{C.bb.bank.name}</span>
            <span className="text-xl font-bold">적용금리 {pct(C.bb.r)}</span>
            <Badge variant="green">14개 중 {rank}위</Badge>
          </div>

          <div className="mt-4 grid gap-2">
            <Crit label="선정 기준">
              참여 14개 은행은 우대조건(
              {isNew ? (
                <b>첫거래(예적금 미보유)·급여이체·카드·저소득·재무상담·출시</b>
              ) : (
                <b>도약 연계가입(갈아타기 자동충족)·급여이체·카드·저소득·재무상담·출시</b>
              )}
              )이 제각각이라, 입력하신 거래현황을 각 은행 규칙에 대입해 <b>적용금리가 가장 높은 곳</b>을 추천합니다.
            </Crit>
            {isNew && (
              <Crit label="첫거래 가정">
                해당 은행에 <b>직전 6개월~1년 예적금이 없는 첫거래</b> 기준입니다(은행별 조건 상이). 기존 예적금이 있으면
                이 우대(약 {((C.bb.bank.switchPref ?? 0) * 100).toFixed(1)}%p)는 빠질 수 있어요.
              </Crit>
            )}
            <Crit label="적용금리 구성">
              기본 {pct(MIRAE.baseRate)} + 우대 <b>+{(C.bb.pref * 100).toFixed(1)}%p</b> = <b>{pct(C.bb.r)}</b> (기관
              상한 {(groupMax * 100).toFixed(0)}%p 이내 — 공통우대 포함 캡)
            </Crit>
            <Crit label="내게 적용된 우대">
              {C.bb.tier}
              {C.bb.tier === '기본금리만' &&
                ' — 우대조건 미충족이라 기본금리만 적용됩니다. 급여이체·자동이체를 이 은행으로 옮기면 더 올라갑니다.'}
            </Crit>
            {C.bb.bank.marketingReq && (
              <Crit label="전제조건">
                이 은행 우대는 <b>마케팅 수신 동의</b>가 전제입니다. 동의하지 않으면 적용금리가 낮아질 수 있어요.
              </Crit>
            )}
            <Crit label="데이터">
              {C.bb.grade === 'verified'
                ? '은행연합회 소비자포털 비교공시 정본(verified)'
                : C.bb.grade === 'press'
                  ? '언론 교차확인(press) — 가입 전 재확인'
                  : '미확인(unknown) — 가입 전 반드시 확인'}
            </Crit>
          </div>

          {manualDiff && (
            <div className="mt-3 rounded-lg border border-[#f0d9b0] bg-fin-amber-soft px-3 py-2.5 text-[13px] text-[#6b4310]">
              현재 결론·비교 패널은 <b>수동 선택</b>하신 {C.bank.name}({pct(C.rMirae)}) 기준으로 계산됩니다. 거래현황상
              최적은 위 {C.bb.bank.name}({pct(C.bb.r)})입니다.
            </div>
          )}
          <p className="mini">전체 14개 은행 순위·우대 근거는 아래 ‘은행별 적용금리 랭킹’ 표에서 확인하세요.</p>
        </CardContent>
      </Card>
    </>
  );
}
