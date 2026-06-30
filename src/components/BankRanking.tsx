import { useState } from 'react';
import { BANKS } from '../data/banks';
import { bankRate, miraeContribMonthly, product, type Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOP_N = 5;
type Variant = 'green' | 'blue' | 'muted';

const GRADE: Record<string, { cls: string; sym: string; title: string }> = {
  verified: { cls: 'text-fin-green', sym: '✓', title: '데이터: 은행연합회 포털 정본(verified)' },
  press: { cls: 'text-fin-amber', sym: '⚠', title: '데이터: 언론 교차확인(press)' },
  unknown: { cls: 'text-muted-foreground', sym: '?', title: '데이터: 미확인(unknown)' },
};
// 색만으로 등급을 구분하지 않도록 기호(✓/⚠/?)를 함께 노출하고, 스크린리더용 텍스트를 별도 제공
function GradeDot({ g }: { g: keyof typeof GRADE }) {
  const m = GRADE[g] ?? GRADE.unknown;
  return (
    <span className={cn('ml-1 align-middle text-[11px] font-bold', m.cls)} title={m.title}>
      <span aria-hidden>{m.sym}</span>
      <span className="sr-only">{m.title}</span>
    </span>
  );
}

export function BankRanking({ I }: { I: Inputs }) {
  const [showAll, setShowAll] = useState(false);
  const isNew = I.scenario === 'new';
  const autoLabel = isNew ? '첫거래 자동' : '갈아타기 자동';
  const rows = BANKS.map((b) => {
    const x = bankRate(b, I);
    const p = product(I.miraeMonthly, 36, x.r, miraeContribMonthly(I.miraeMonthly, I.type));
    return { b, x, total: p.total };
  }).sort((a, b) => b.x.r - a.x.r || a.b.grp - b.b.grp);
  const bestId = rows[0]?.b.id;
  const shown = (showAll ? rows : rows.slice(0, TOP_N)).map((r, i) => ({
    ...r,
    i,
    isBest: r.b.id === bestId,
    // 거래 없이 자동 가산되는 우대 — switchPref(도약연계/첫거래) + 출시. 양 모드 동일 적용.
    switchAuto: (r.b.switchPref ?? 0) + r.b.launchBonus,
    variant: (r.x.tier.includes('도약연계') || r.x.tier.includes('첫거래')
      ? 'green'
      : r.x.tier.includes('급여이체') || r.x.tier.includes('카드')
        ? 'blue'
        : 'muted') as Variant,
  }));

  return (
    <>
      <h2 className="sec">내 거래현황 기준 추천 은행 (상위 {TOP_N})</h2>
      <Card>
        <CardContent className="pt-5">
          {/* 모바일: 카드 (가로 스크롤·욱여넣기 대신) */}
          <div className="grid gap-2 md:hidden">
            {shown.map(({ b, x, total, i, isBest, variant, switchAuto }) => (
              <div key={b.id} className={cn('rounded-xl border p-3', isBest && 'border-fin-green bg-fin-green-soft')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-bold">
                        {b.name}
                        <GradeDot g={b.grade} />
                        {isBest && (
                          <Badge variant="green" className="ml-1">
                            최적
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">최고 {b.grp === 3 ? '8' : '7'}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-2xl font-extrabold', isBest ? 'text-fin-green' : 'text-foreground')}>
                      {pct(x.r)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">3년 {fmtMoney(total)}</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant={variant}>{x.tier}</Badge>
                  {switchAuto > 0 ? (
                    <Badge variant="green">
                      {autoLabel} +{(switchAuto * 100).toFixed(1)}%p
                    </Badge>
                  ) : (
                    <Badge variant="muted">{autoLabel} 우대 없음</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {b.cardPref != null
                      ? `카드 ${b.cardCond} (+${(b.cardPref * 100).toFixed(1)}%p)`
                      : '카드 우대 미공시'}
                  </span>
                  {b.marketingReq && <span className="text-[11px] text-fin-amber">· 마케팅동의 필요</span>}
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">순위</TableHead>
                  <TableHead>은행</TableHead>
                  <TableHead className="text-right">적용금리</TableHead>
                  <TableHead className="text-right">{autoLabel}</TableHead>
                  <TableHead>우대 적용 근거</TableHead>
                  <TableHead>카드 실적조건(공시)</TableHead>
                  <TableHead className="text-right">3년 만기수령</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map(({ b, x, total, i, isBest, variant, switchAuto }) => (
                  <TableRow key={b.id} className={cn(isBest && 'bg-fin-green-soft')}>
                    <TableCell className="text-center font-bold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      {b.name}
                      <span className="text-xs text-muted-foreground"> (최고 {b.grp === 3 ? '8' : '7'}%)</span>
                      <GradeDot g={b.grade} />
                      {isBest && (
                        <Badge variant="green" className="ml-1">
                          최적
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <b>{pct(x.r)}</b>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {switchAuto > 0 ? (
                        <span className="font-semibold text-fin-green">+{(switchAuto * 100).toFixed(1)}%p</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>{x.tier}</Badge>
                      {b.marketingReq && <span className="ml-1 text-[11px] text-fin-amber">마케팅동의</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.cardPref != null ? `${b.cardCond} (+${(b.cardPref * 100).toFixed(1)}%p)` : <i>공시 미확인</i>}
                    </TableCell>
                    <TableCell className="text-right">{fmtMoney(total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
              {showAll ? `상위 ${TOP_N}개만 보기 ▴` : `전체 ${rows.length}개 은행 보기 ▾`}
            </Button>
          </div>

          <p className="mini mt-2.5">
            내 거래현황 기준 적용금리 높은 순.{' '}
            {isNew
              ? '‘첫거래 자동’ = 해당 은행 첫거래(직전 6개월~1년 예적금 미보유) 시 거래 없이 받는 우대 + 출시·한시 우대(기존 예적금 보유 시 일부 미적용).'
              : '‘갈아타기 자동’ = 도약계좌 보유자가 거래 없이도 받는 우대(도약 연계가입·예적금 미보유 + 출시·한시 우대).'}{' '}
            여기에 급여이체·카드 우대 + 공통우대(소득 0.5%p·재무상담 0.2%p)를 합산하되 기관 상한(8%/7%)으로 캡합니다. 항목별 %p·충족조건은 은행연합회 소비자포털 비교공시 정본
            기준(2026-06)이며 가입 전{' '}
            <a
              className="text-primary hover:underline"
              href="https://portal.kfb.or.kr/compare/receiving_youth_future_2.php"
              target="_blank"
              rel="noopener"
            >
              은행연합회 소비자포털
            </a>
            에서 가입 전 재확인하세요. <span className="text-fin-green">●</span> 는 데이터 등급(정본/언론/미상),
            ‘마케팅동의’ 표시 은행은 우대에 마케팅 수신 동의가 전제됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
