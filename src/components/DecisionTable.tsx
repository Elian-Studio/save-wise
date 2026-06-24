import type { DecisionFactor, Recommendation } from '../lib/calc';
import { RECOMMEND } from '../lib/calc';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function Side({ f, side }: { f: DecisionFactor; side: 'stay' | 'switch' }) {
  const text = side === 'stay' ? f.stayText : f.switchText;
  const on = f.favors === side;
  const tone = side === 'switch' ? 'text-fin-green' : 'text-fin-blue';
  if (!on) return <span className="text-muted-foreground">{text}</span>;
  return (
    <span className={cn('font-semibold', tone)}>
      <span aria-hidden>✓ </span>
      {text}
      <span className="ml-1 rounded bg-white/70 px-1 text-[11px] font-bold">+{f.weight.toFixed(1)}</span>
    </span>
  );
}

export function DecisionTable({ rec }: { rec: Recommendation }) {
  const recStay = rec.verdict === 'stay';
  const recSwitch = rec.verdict === 'switch';
  const verdictTone = recSwitch ? 'text-fin-green' : recStay ? 'text-fin-blue' : 'text-fin-amber';

  return (
    <>
      <h2 className="sec">왜 이렇게 추천했나 — 항목별 비교</h2>
      <p className="mini mb-3.5">
        결론은 아래 6개 요인의 점수 합으로 정해집니다. ✓ 표시가 각 요인이 <b>유지</b>와 <b>전환</b> 중 어느 쪽을
        지지하는지와 그 무게(+점수)입니다.
      </p>
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[36%]">판단 요인</TableHead>
                <TableHead className={cn('text-right', recStay && 'text-fin-blue')}>
                  ① 유지 · 도약(5년)
                  {recStay && (
                    <Badge variant="blue" className="ml-1">
                      추천
                    </Badge>
                  )}
                </TableHead>
                <TableHead className={cn('text-right', recSwitch && 'text-fin-green')}>
                  ② 전환 · 미래(3년)
                  {recSwitch && (
                    <Badge variant="green" className="ml-1">
                      추천
                    </Badge>
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rec.factors.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="align-top">
                    <div className="font-semibold">{f.label}</div>
                    <div className="mini">{f.why}</div>
                  </TableCell>
                  <TableCell className={cn('text-right align-top', f.favors === 'stay' && 'bg-fin-blue-soft')}>
                    <Side f={f} side="stay" />
                  </TableCell>
                  <TableCell className={cn('text-right align-top', f.favors === 'switch' && 'bg-fin-green-soft')}>
                    <Side f={f} side="switch" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">종합 점수 (전환 +, 유지 −)</span>
            <span className="font-bold">
              {rec.score > 0 ? '+' : ''}
              {rec.score.toFixed(1)} → <span className={verdictTone}>{rec.main}</span>
            </span>
          </div>
          <p className="mini">
            점수 ≥ +{RECOMMEND.switchAt.toFixed(1)} → 전환 · ≤ −{Math.abs(RECOMMEND.stayAt).toFixed(1)} → 유지 · 그
            사이는 접전(우선순위로 결정). 가중치는 정책상 추정치이며 항목별 사유는 위 표를 참고하세요.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
