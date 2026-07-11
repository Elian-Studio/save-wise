import { SCHEMES } from '../../data/transitSchemes';
import { HOME_FAQ } from '../../data/transitSchemeGuides';

// 홈 히어로 아래 상시 노출 가이드 — SSG HTML에 항상 포함되는 읽을거리(콘텐츠 보강).
// compareRows는 5개 제도가 동일 키·순서라 첫 제도 기준으로 피벗해 시맨틱 표로 렌더.
const COMPARE_KEYS = SCHEMES[0].compareRows.map((r) => r.k);

export function HomeGuide({ onStartQuiz }: { onStartQuiz: () => void }) {
  return (
    <section className="mx-auto mt-24 w-full max-w-[880px] text-left">
      {/* 1. 5종 한눈에 */}
      <h2 className="text-[clamp(24px,3.5vw,32px)] font-extrabold tracking-[-0.03em] text-ink">
        2026 교통카드 5종, 한눈에
      </h2>
      <div className="mt-4 flex flex-col gap-3.5">
        <p className="text-[15.5px] font-medium leading-[1.7] text-foreground/90">
          2026년 교통카드는 크게 두 갈래야 — 전국에서 쓴 만큼 돌려받는 <b>환급형</b>(K-패스·The 경기패스·인천
          I-패스)과 조건 없이 찍고 타는 <b>후불카드</b>. 서울 정기권이던 기후동행카드는 선불 30일권이 2026년 7월
          31일(후불형 8월 31일) 충전 종료라, 새로 시작한다면 K-패스로 보는 게 맞아. 사는 곳과 이용 패턴에 따라 이득이
          갈려.
        </p>
        <p className="text-[15.5px] font-medium leading-[1.7] text-foreground/90">
          2026년 환급형은 크게 바뀌었어. 비율 환급(20~53%)에 더해 <b>기준금액 초과분 환급</b>이 생겨서, 둘 중
          더 많이 돌려받는 쪽이 자동 적용돼. 게다가 2026년 4~9월엔 수도권 기준금액이 한시적으로 반값이라
          환급액이 더 커졌어.
        </p>
        <p className="text-[15.5px] font-medium leading-[1.7] text-foreground/90">
          경기·인천 거주자는 K-패스 대신 The 경기패스·인천 I-패스가 자동 적용돼서 환급 횟수 제한이 없고 청년
          기준도 39세까지 넉넉해. 아래 표로 다섯 제도를 한눈에 비교해봐.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[18px] border border-line">
        <table className="min-w-[640px] w-full border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-card">
              <th scope="col" className="px-4 py-3 font-bold text-muted-foreground">
                구분
              </th>
              {SCHEMES.map((s) => (
                <th key={s.id} scope="col" className="px-4 py-3 font-extrabold text-ink">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ background: s.color }}
                      aria-hidden="true"
                    />
                    {s.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_KEYS.map((key, i) => (
              <tr key={key} className={i < COMPARE_KEYS.length - 1 ? 'border-b border-line' : ''}>
                <th scope="row" className="px-4 py-3 font-bold text-muted-foreground whitespace-nowrap">
                  {key}
                </th>
                {SCHEMES.map((s) => (
                  <td key={s.id} className="px-4 py-3 font-medium leading-[1.5] text-foreground/90">
                    {s.compareRows[i].v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. 결정 가이드 */}
      <h2 className="mt-16 text-[clamp(24px,3.5vw,32px)] font-extrabold tracking-[-0.03em] text-ink">
        어떤 카드를 골라야 하나
      </h2>
      <div className="mt-4 flex flex-col gap-3.5">
        <p className="text-[15.5px] font-medium leading-[1.7] text-foreground/90">
          순서대로 따져보면 쉬워. <b>①</b> 먼저 한 달에 15번도 안 탄다면 환급 조건이 안 되니 후불카드가 편해.{' '}
          <b>②</b> 경기도나 인천에 살면 별도 신청 없이 자동 적용되는 The 경기패스·인천 I-패스를 먼저 봐(환급 횟수
          무제한). <b>③</b> 그 밖의 지역이거나 여러 지역을 오가면 전국에서 쓰는 K-패스가 정답이야. 서울 정기권이던
          기후동행카드는 30일권 충전이 2026년 7월 말 종료라, 이미 충전한 카드가 아니면 K-패스로 갈아타야 해.
        </p>
        <p className="text-[15.5px] font-medium leading-[1.7] text-foreground/90">
          나이도 변수야 — 청년(K-패스는 34세, 경기·인천은 39세까지)은 환급률이 30%로 올라가고, 65세 이상
          어르신도 30%를 돌려받아. 조건이 얽혀 헷갈리면 퀴즈로 내 상황을 넣어보는 게 제일 빨라.
        </p>
      </div>
      <button
        type="button"
        onClick={onStartQuiz}
        className="mt-6 min-h-11 rounded-full bg-navy px-[30px] py-4 text-[16px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-navy2"
      >
        30초 퀴즈로 내 카드 찾기 →
      </button>

      {/* 3. 홈 FAQ */}
      <h2 className="mt-16 text-[clamp(24px,3.5vw,32px)] font-extrabold tracking-[-0.03em] text-ink">
        자주 묻는 질문
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {HOME_FAQ.map((f) => (
          <div key={f.q} className="rounded-[18px] border border-line bg-card p-5">
            <div className="text-[15px] font-extrabold text-ink">Q. {f.q}</div>
            <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
