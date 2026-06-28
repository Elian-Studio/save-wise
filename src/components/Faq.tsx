import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// index.html의 FAQPage JSON-LD와 동일 Q&A를 화면에도 노출 — 구조화 데이터·가시 콘텐츠 일치.
const faqs: Array<{ q: string; a: ReactNode }> = [
  {
    q: '청년도약계좌에서 청년미래적금으로 갈아타면 기존 혜택을 잃나요?',
    a: (
      <>
        청년미래적금에 먼저 가입·계좌개설한 뒤 청년도약계좌를 <b>‘특별중도해지’</b>하면 기존 납입분의
        정부기여금과 비과세가 손실 없이 환급됩니다. 순서를 어겨 도약계좌를 먼저 해지하면 혜택이 사라집니다.
      </>
    ),
  },
  {
    q: '청년미래적금 우대형(정부기여금 12%) 조건은 무엇인가요?',
    a: (
      <>
        중소기업 신규취업자(전년도 최초 취업 + 현재 중소기업 재직 등)가 대표적입니다. 일반형은 납입액의 6%,
        우대형은 12%를 정부가 매월 매칭 지급합니다.
      </>
    ),
  },
];

export function Faq() {
  return (
    <>
      <h2 className="sec">자주 묻는 질문</h2>
      <Card>
        <CardContent className="grid gap-4 pt-5 text-[13.5px]">
          {faqs.map((f) => (
            <div key={f.q}>
              <p className="m-0 font-semibold text-navy">Q. {f.q}</p>
              <p className="mt-1.5 text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
