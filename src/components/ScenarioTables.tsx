import { compute, recommend, type Inputs } from '../lib/calc';
import { fmtMoney, pct } from '../lib/format';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function recTag(score: number) {
  if (score >= 1) return <Badge variant="green">전환</Badge>;
  if (score <= -1) return <Badge variant="blue">유지</Badge>;
  return <Badge variant="amber">접전</Badge>;
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
      <h2 className="sec">시나리오별 결론 (변수 하나씩 바꿔보기)</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <p className="mb-2 font-bold text-navy">소득구간별</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>총급여(만원)</TableHead>
                  <TableHead className="text-right">도약 월기여금</TableHead>
                  <TableHead className="text-right">3년 순이익 차액</TableHead>
                  <TableHead className="text-right">추천</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((s) => {
                  const J = { ...I, salary: s };
                  const C = compute(J);
                  const R = recommend(J, C);
                  return (
                    <TableRow key={s}>
                      <TableCell>{s.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{fmtMoney(C.leapContrib)}</TableCell>
                      <TableCell className="text-right">
                        {C.diff3yr >= 0 ? '+' : ''}
                        {fmtMoney(C.diff3yr)}
                      </TableCell>
                      <TableCell className="text-right">{recTag(R.score)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mini mt-2">유형·거래현황 고정. 차액 = 같은 월납입 3년 기준 (미래적금 − 도약).</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="mb-2 font-bold text-navy">도약계좌 경과기간별</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>경과(개월)</TableHead>
                  <TableHead className="text-right">잔여</TableHead>
                  <TableHead className="text-right">해지환급금</TableHead>
                  <TableHead className="text-right">추천</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elapses.map((e) => {
                  const J = { ...I, elapsed: e, paidCount: e };
                  const C = compute(J);
                  const R = recommend(J, C);
                  return (
                    <TableRow key={e} className={cn(e === I.elapsed && 'bg-fin-blue-soft')}>
                      <TableCell>{e}</TableCell>
                      <TableCell className="text-right">{60 - e}</TableCell>
                      <TableCell className="text-right">{fmtMoney(C.refund.total)}</TableCell>
                      <TableCell className="text-right">{recTag(R.score)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="mini mt-2">만기 임박일수록 ‘마무리 유지’ 신호가 강해집니다.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardContent className="pt-5">
          <p className="mb-2 font-bold text-navy">유형별 (일반형 6% vs 우대형 12%)</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead className="text-right">미래 적용금리</TableHead>
                <TableHead className="text-right">미래 연 실질효과율</TableHead>
                <TableHead className="text-right">3년 순이익 차액</TableHead>
                <TableHead className="text-right">추천</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TYPES.map(([t, label]) => {
                const J = { ...I, type: t };
                const C = compute(J);
                const R = recommend(J, C);
                return (
                  <TableRow key={t} className={cn(t === I.type && 'bg-fin-blue-soft')}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="text-right">{pct(C.rMirae)}</TableCell>
                    <TableCell className="text-right">{pct(C.mirae.eff)}</TableCell>
                    <TableCell className="text-right">
                      {C.diff3yr >= 0 ? '+' : ''}
                      {fmtMoney(C.diff3yr)}
                    </TableCell>
                    <TableCell className="text-right">{recTag(R.score)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
