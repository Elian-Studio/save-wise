import { BANKS } from '../data/banks';
import { bankRate, miraeContribMonthly, product, type Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>은행</TableHead>
                <TableHead className="text-right">적용금리</TableHead>
                <TableHead>우대 적용 근거</TableHead>
                <TableHead>카드 실적조건(공시)</TableHead>
                <TableHead className="text-right">3년 만기수령</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ b, x, total }) => {
                const variant: 'green' | 'blue' | 'muted' = x.tier.includes('최대')
                  ? 'green'
                  : x.tier.includes('카드')
                    ? 'blue'
                    : 'muted';
                return (
                  <TableRow key={b.id} className={cn(b.id === bestId && 'bg-fin-green-soft')}>
                    <TableCell>
                      {b.name}
                      <span className="text-xs text-muted-foreground"> (최고 {b.grp === 3 ? '8' : '7'}%)</span>
                      {b.id === bestId && (
                        <Badge variant="green" className="ml-1">
                          최적
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <b>{pct(x.r)}</b>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>{x.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.cardPref != null ? `${b.cardCond} (+${(b.cardPref * 100).toFixed(1)}%p)` : <i>공시 미확인</i>}
                    </TableCell>
                    <TableCell className="text-right">{fmtMoney(total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="mini mt-2.5">
            ‘주거래 최대우대’ = 월급/주거래 은행 + 자동이체 충족 시 기관 최고금리(공통우대 포함, 8%/7% 상한). 그 외엔
            은행별 급여이체·카드 우대 + 공통우대(소득 0.5%p·재무상담 0.2%p)를 합산하되 기관 상한으로 캡합니다. 항목별
            %p는 금융위·은행연합회·각 은행 상품설명서·언론 종합값으로 충족조건(금액·횟수·기간)은 은행별로 달라{' '}
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
