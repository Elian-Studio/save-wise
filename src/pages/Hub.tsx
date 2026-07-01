import { Link } from 'react-router-dom';

type ServiceCard = { to: string; emoji: string; title: string; desc: string };

const LIVE: ServiceCard[] = [
  {
    to: '/transit',
    emoji: '🚌',
    title: 'K-패스 모두의카드 교통카드 추천',
    desc: '나이·거주지·교통비로 가장 유리한 카드사 카드를 추천.',
  },
  {
    to: '/youth-savings',
    emoji: '🏦',
    title: '청년도약계좌 ↔ 청년미래적금 갈아타기',
    desc: '유지할까 갈아탈까 + 최적 은행을 내 조건으로 3분 비교.',
  },
];

const SOON: ServiceCard[] = [
  {
    to: '',
    emoji: '💰',
    title: '연금저축 · IRP · ISA 세액공제',
    desc: '세액공제 최대화하려면 어디에 얼마씩 넣을지.',
  },
];

export function Hub() {
  return (
    <main className="mx-auto max-w-[1080px] px-[18px] py-12">
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">돈 관련 결정, 3분 만에</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        청년 적금·교통카드·연금까지, 은행 광고가 아니라 <b className="text-ink">내 조건</b>으로 가장 유리한 선택을
        비교해 드립니다.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {LIVE.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="rounded-[14px] border bg-card p-5 transition hover:border-navy hover:shadow-sm"
          >
            <div className="text-2xl">{s.emoji}</div>
            <div className="mt-2 font-bold text-navy">{s.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
          </Link>
        ))}
        {SOON.map((s) => (
          <div key={s.title} className="rounded-[14px] border border-dashed bg-muted/20 p-5">
            <div className="text-2xl">{s.emoji}</div>
            <div className="mt-2 font-bold text-muted-foreground">
              {s.title} <span className="text-xs font-normal">(준비중)</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
