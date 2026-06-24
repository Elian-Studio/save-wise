import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ProductCompare() {
  const rows: Array<[string, string, string]> = [
    ['만기', '5년 (60개월)', '3년 (36개월)'],
    ['월 납입한도', '70만원', '50만원'],
    ['금리', '기본 3년 고정 후 변동 (최대 ~6%)', '기본 5% + 우대(3년 고정), 최고 7~8%'],
    ['정부기여금', '소득구간별 월 최대 2.1~3.3만원', '납입액의 6%(일반)·12%(우대) 월 매칭'],
    ['비과세', 'O', 'O'],
    ['가입연령', '만 19~34세', '만 19~34세 (병역 제외)'],
    ['실질효과(광고)', '최대 연 9.5%대', '일반형 13~14% · 우대형 18~19%대'],
  ];
  return (
    <>
      <h2 className="sec">8. 상품 기본 비교</h2>
      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>구분</TableHead>
                <TableHead>청년도약계좌</TableHead>
                <TableHead>청년미래적금</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([k, a, b]) => (
                <TableRow key={k}>
                  <TableCell className="font-medium">{k}</TableCell>
                  <TableCell>{a}</TableCell>
                  <TableCell>{b}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
