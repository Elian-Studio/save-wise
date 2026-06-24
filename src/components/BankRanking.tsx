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

export function BankRanking({ I }: { I: Inputs }) {
  const [showAll, setShowAll] = useState(false);
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
    switchAuto: (r.b.switchPref ?? 0) + r.b.launchBonus, // 갈아타기 시 거래 없이 자동 가산되는 우대
    variant: (r.x.tier.includes('도약연계')
      ? 'green'
      : r.x.tier.includes('급여이체') || r.x.tier.includes('카드')
        ? 'blue'
        : 'muted') as Variant,
  }));

  return (
    <>
      <h2 className="sec">4. 내 거래현황 기준 추천 은행 (상위 {TOP_N})</h2>
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
                    <Badge variant="green">갈아타기 자동 +{(switchAuto * 100).toFixed(1)}%p</Badge>
                  ) : (
                    <Badge variant="muted">갈아타기 자동우대 없음</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {b.cardPref != null
                      ? `카드 ${b.cardCond} (+${(b.cardPref * 100).toFixed(1)}%p)`
                      : '카드 우대 미공시'}
                  </span>
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
                  <TableHead className="text-right">갈아타기 자동</TableHead>
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
            내 거래현황 기준 적용금리 높은 순. ‘갈아타기 자동’ = 도약계좌 보유자가 거래 없이도 받는 우대(도약 연계가입·예적금
            미보유 + 출시·한시 우대). 여기에 급여이체·카드 우대 + 공통우대(소득 0.5%p·재무상담 0.2%p)를 합산하되 기관
            상한(8%/7%)으로 캡합니다. 항목별 %p·충족조건은 은행연합회 소비자포털 비교공시 정본 기준(2026-06)이며 가입 전{' '}
            <a
              className="text-primary hover:underline"
              href="https://portal.kfb.or.kr/compare/receiving_youth_future_2.php"
              target="_blank"
              rel="noopener"
            >
              은행연합회 소비자포털
            </a>
            에서 가입 전 재확인하세요.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
