import { useMemo, useState } from 'react';
import { Slider, Segments, type SegOption } from '../../components/wizard/controls';
import { DATA_AS_OF } from '../../data/transitCards';
import type { AgeTier, CardType, TransitCard, Benefit } from '../../data/transitCards';
import {
  compare,
  rankCards,
  type Region,
  type Transit as TransitMode,
} from '../../lib/transitCardRec';

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

const REGION_SEGS: SegOption<Region>[] = [
  { label: '서울 위주', value: 'seoul' },
  { label: '수도권(경기·인천)', value: 'metro' },
  { label: '그 외 지역', value: 'other' },
];
const TRANSIT_SEGS: SegOption<TransitMode>[] = [
  { label: '지하철·버스', value: 'bs' },
  { label: 'GTX·신분당·광역', value: 'wide' },
  { label: '따릉이 포함', value: 'bike' },
];
const AGE_SEGS: SegOption<AgeTier>[] = [
  { label: '일반', value: 'general' },
  { label: '청년 19~34', value: 'youth' },
  { label: '저소득', value: 'low' },
  { label: '어르신 65+', value: 'senior' },
];
const TYPE_SEGS: SegOption<CardType>[] = [
  { label: '신용카드 (추가할인↑)', value: 'credit' },
  { label: '체크카드 (연회비 0)', value: 'check' },
];
// 전월실적(직전 달 카드 사용액). 카드 추가혜택은 대부분 실적 조건이 붙어, 실제 받는 혜택이 달라진다.
const PREV_SPEND_SEGS: SegOption<number>[] = [
  { label: '실적 없음', value: 0 },
  { label: '30만↑', value: 300000 },
  { label: '50만↑', value: 500000 },
  { label: '100만↑', value: 1000000 },
];
const prevLabel = (v: number) => (v === 0 ? '실적 없음' : `전월 ${v / 10000}만↑`);

// 카드 혜택을 한 줄로 요약 — pct(대중교통 %·월 한도) / flat(월 교통 minSpend↑ 시 정액).
const benefitSummary = (b: Benefit) =>
  b.kind === 'pct'
    ? `대중교통 ${b.pct * 100}%${b.monthlyCap ? ` · 월 ${won(b.monthlyCap)} 한도` : ''}`
    : `교통 ${b.minSpend / 10000}만↑ 시 월 ${won(b.amount)}`;

const STEP_KEYS = ['use', 'card', 'result'] as const;
const STEP_LABELS = ['이용 조건', '카드 조건', '결과'];

export function Transit() {
  const [region, setRegion] = useState<Region>('seoul');
  const [transit, setTransit] = useState<TransitMode>('bs');
  const [age, setAge] = useState<AgeTier>('general');
  const [fare, setFare] = useState(75000);
  const [cardType, setCardType] = useState<CardType>('check');
  const [prevSpend, setPrevSpend] = useState(0);
  const [step, setStep] = useState(0);

  const cmp = useMemo(() => compare(fare, age, region, transit), [fare, age, region, transit]);
  const ranked = useMemo(() => rankCards(fare, cardType, prevSpend), [fare, cardType, prevSpend]);
  const best = ranked.find((r) => r.eligible && r.add > 0);
  const top5 = ranked.slice(0, 5);

  const lastStep = STEP_KEYS.length - 1;
  const cur = STEP_KEYS[step];
  const next = () => {
    setStep((s) => (s < lastStep ? s + 1 : 0));
    window.scrollTo({ top: 0 });
  };
  const prev = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0 });
  };

  // 입력 스텝(이용/카드 조건) 우측 sticky LIVE — K-패스 실부담 실시간 피드백. 결과 스텝에선 히어로로 승격.
  const liveAside = (
    <aside className="rounded-2xl bg-gradient-to-br from-fin-green to-[#0f6b32] p-6 text-white lg:sticky lg:top-4">
      <div className="text-[11.5px] font-bold tracking-wide opacity-80">내 조건 · K-패스 월 실부담 · LIVE</div>
      <div className="mt-1 text-[30px] font-extrabold tabular-nums">{won(cmp.kpassNet)}</div>
      <p className="mt-3 text-[13px] leading-relaxed opacity-95">
        {cmp.climateAvailable
          ? cmp.winner === 'kpass'
            ? `기후동행카드(${won(cmp.climateNet!)})보다 유리해요. 월 15회 이상 이용 시 자동 환급됩니다.`
            : `이 구간은 기후동행카드(${won(cmp.climateNet!)})가 더 저렴할 수 있어요. 서울 시내 무제한권입니다.`
          : '서울 외·GTX 구간이라 기후동행카드는 이용 불가 — K-패스가 유일하게 전국에서 환급됩니다.'}
      </p>
    </aside>
  );

  return (
    <>
      <header className="bg-gradient-to-br from-navy to-navy2 py-6 text-white">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3 px-[18px]">
          <h1 className="text-xl font-extrabold tracking-tight">K-패스 모두의카드 교통카드 추천</h1>
          <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[12.5px] font-semibold">
            혜택 기준 {DATA_AS_OF} · 매월 변동
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[18px] pb-20 pt-6">
        <p className="mb-2 text-[15px] leading-relaxed text-muted-foreground">
          2026 K-패스는 <b className="text-ink">모두의카드</b>(정액제·초과분 전액환급)로 바뀌어, 대부분{' '}
          <b className="text-ink">K-패스가 기후동행보다 유리</b>합니다. 그럼 <b className="text-ink">어느 카드사</b>가
          가장 좋을까요? 내 조건으로 찾아드립니다.
        </p>

        {/* 진행 단계 — 뒤로만 클릭 가능. done=✓, active=primary. */}
        <nav aria-label="진행 단계" className="flex flex-wrap items-center gap-1.5 pt-3">
          {STEP_LABELS.map((label, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <button
                key={label}
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                  active ? 'bg-accent text-ink' : 'text-muted-foreground'
                } ${i > step ? 'cursor-default opacity-60' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    active ? 'bg-primary text-white' : done ? 'bg-fin-green text-white' : 'bg-line text-muted-foreground'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="text-[12.5px] font-bold">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* key={step}로 스텝 전환마다 재마운트 → fade+slide-up 진입 애니메이션(접근성 motion-reduce).
            모든 스텝을 hidden으로 전마운트 → 프리렌더에 전 스텝 HTML 유지(SEO). lg:min-h로 입력 스텝 버튼 Y 고정. */}
        <div
          key={step}
          className="pt-5 pb-4 duration-300 ease-out animate-in fade-in slide-in-from-bottom-3 motion-reduce:animate-none lg:min-h-[480px]"
        >
          {/* STEP 0 — 이용 조건 */}
          <section hidden={cur !== 'use'}>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-6">
                <Field label="주로 어디서 타나요?">
                  <Segments options={REGION_SEGS} value={region} onChange={setRegion} cols={1} aria-label="거주/이용 지역" />
                </Field>
                <Field label="주 이용 수단">
                  <Segments options={TRANSIT_SEGS} value={transit} onChange={setTransit} cols={1} aria-label="이용 수단" />
                </Field>
                <Field label="대상 유형">
                  <Segments options={AGE_SEGS} value={age} onChange={setAge} aria-label="대상 유형" />
                </Field>
              </div>
              {liveAside}
            </div>
          </section>

          {/* STEP 1 — 카드 조건 */}
          <section hidden={cur !== 'card'}>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-6">
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label className="text-[14px] font-bold text-ink">월 평균 교통비</label>
                    <div className="text-[18px] font-bold tabular-nums text-primary">{won(fare)}</div>
                  </div>
                  <Slider min={20000} max={150000} step={5000} value={fare} onChange={setFare} aria-label="월 평균 교통비" />
                </div>
                <Field label="카드 종류">
                  <Segments options={TYPE_SEGS} value={cardType} onChange={setCardType} cols={1} aria-label="카드 종류" />
                </Field>
                <Field label="전월 카드 실적">
                  <Segments options={PREV_SPEND_SEGS} value={prevSpend} onChange={setPrevSpend} aria-label="전월 카드 실적" />
                  <p className="mini">
                    대부분의 교통 추가혜택은 전월실적 조건이 붙어요. 실제 받는 혜택만 순위에 반영합니다.
                  </p>
                </Field>
              </div>
              {liveAside}
            </div>
          </section>

          {/* STEP 2 — 결과: K-패스 vs 기후동행 히어로 + best 배너 + TOP5 카드 슬라이드 */}
          <section hidden={cur !== 'result'}>
            <div className="rounded-2xl bg-gradient-to-br from-fin-green to-[#0f6b32] p-6 text-white">
              <div className="text-[11.5px] font-bold tracking-wide opacity-80">내 조건 · K-패스 월 실부담</div>
              <div className="mt-1 text-[34px] font-extrabold tabular-nums">{won(cmp.kpassNet)}</div>
              <p className="mt-3 text-[13.5px] leading-relaxed opacity-95">
                {cmp.climateAvailable
                  ? cmp.winner === 'kpass'
                    ? `기후동행카드(${won(cmp.climateNet!)})보다 유리해요. 월 15회 이상 이용 시 자동 환급됩니다.`
                    : `이 구간은 기후동행카드(${won(cmp.climateNet!)})가 더 저렴할 수 있어요. 서울 시내 무제한권입니다.`
                  : '서울 외·GTX 구간이라 기후동행카드는 이용 불가 — K-패스가 유일하게 전국에서 환급됩니다.'}
              </p>
            </div>

            {best && (
              <div className="mt-4 rounded-xl bg-secondary px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                💡 지금 조건이면 <b className="text-ink">{best.card.issuer} {best.card.name}</b>가 K-패스 환급 위에 월{' '}
                <b className="text-fin-green">{won(best.add)}</b>을 더 아껴줘요.
              </div>
            )}

            <div className="mt-6 text-[17px] font-extrabold">
              내 조건 K-패스 {cardType === 'credit' ? '신용' : '체크'}카드 TOP5
            </div>
            <div className="mb-3 text-[12.5px] text-muted-foreground">
              월 교통비 {won(fare)} · <b className="text-ink">{prevLabel(prevSpend)}</b> 기준, 실제 받는 카드 추가절감 −
              연회비(월환산) 순 · 좌우로 넘겨보세요
            </div>
            <div className="-mx-[18px] flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-[18px] pb-2">
              {top5.map((r, i) => {
                // 순위 번호는 실제 혜택을 받는(자격+절감>0) 카드에만. 미자격은 회색.
                const rankNo = top5.slice(0, i + 1).filter((x) => x.eligible && x.add > 0).length;
                const active = r.eligible && r.add > 0;
                return <CardTile key={r.card.id} r={r} rankNo={rankNo} active={active} />;
              })}
            </div>
          </section>
        </div>

        {/* 하단 sticky 네비 — 이전 / 다음 단계 → / 마지막은 처음부터 리셋. */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-4 py-3 lg:justify-end">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="min-h-11 rounded-xl border border-line bg-card px-5 font-bold text-muted-foreground disabled:opacity-40"
          >
            ← 이전
          </button>
          <button
            type="button"
            onClick={next}
            className={`min-h-11 rounded-xl px-6 font-bold ${
              step < lastStep ? 'bg-primary text-white shadow-sm' : 'border border-line bg-card text-muted-foreground'
            }`}
          >
            {step < lastStep ? '다음 단계 →' : '↻ 처음부터'}
          </button>
        </div>

        <p className="mt-5 text-[11.5px] leading-relaxed text-muted-foreground">
          ※ 추천은 거주지·연령·전월실적에 따라 달라지며, 카드 추가혜택은 전월실적 충족을 가정한 추정치입니다. K-패스
          환급은 정부(월 15회 이상)가, 카드 추가혜택은 각 카드사가 제공합니다. ‘확인필요’ 표시 카드와 모든 수치는
          가입 전 각 카드사 공식 페이지에서 재확인하세요. 기후동행카드는 서울 시내 전용이며 GTX·신분당선·서울 외
          하차는 제외됩니다. 혜택은 매월 변동될 수 있습니다({DATA_AS_OF} 기준).
        </p>
      </main>
    </>
  );
}

// 결과 스텝 카드 타일 — 실물 카드 비율(~1.58:1) 카드 그래픽 + 혜택/실적/절감/신청.
function CardTile({
  r,
  rankNo,
  active,
}: {
  r: { card: TransitCard; eligible: boolean; add: number };
  rankNo: number;
  active: boolean;
}) {
  const medal = !active
    ? 'from-line to-line'
    : rankNo === 1
      ? 'from-fin-green to-[#0f6b32]'
      : rankNo === 2
        ? 'from-[#9aa6bc] to-[#6b7688]'
        : rankNo === 3
          ? 'from-[#b97f50] to-[#8a5a34]'
          : 'from-navy to-navy2';
  return (
    <article
      className={`w-[248px] shrink-0 snap-start rounded-2xl border p-3.5 ${
        !active ? 'border-line bg-secondary/40 opacity-70' : 'border-line bg-card'
      }`}
    >
      <div className={`flex aspect-[1.58/1] flex-col justify-between rounded-xl bg-gradient-to-br ${medal} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-[15px] font-extrabold">
            {active ? rankNo : '—'}
          </span>
          {r.card.grade === 'press' && (
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">확인필요</span>
          )}
        </div>
        <div>
          <div className="text-[13px] font-semibold opacity-90">{r.card.issuer}</div>
          <div className="text-[15px] font-extrabold leading-tight">{r.card.name}</div>
        </div>
      </div>

      <div className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{benefitSummary(r.card.benefit)}</div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">
        연회비 {r.card.annualFee === 0 ? '없음' : won(r.card.annualFee)} · 전월실적{' '}
        {r.card.minPrevSpend === 0 ? '없음' : `${r.card.minPrevSpend / 10000}만↑`}
      </div>

      <div className="mt-3">
        {active ? (
          <div className="text-[20px] font-extrabold tabular-nums text-fin-green">
            +{won(r.add)}
            <span className="text-[11px] font-normal text-muted-foreground">/월</span>
          </div>
        ) : !r.eligible ? (
          <div className="text-[12px] font-semibold text-muted-foreground">전월 {r.card.minPrevSpend / 10000}만↑ 필요</div>
        ) : (
          <div className="text-[12px] font-semibold text-muted-foreground">+0원 (교통비 조건 미달)</div>
        )}
      </div>

      {r.card.applyUrl && (
        <a
          href={r.card.applyUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 block rounded-lg bg-primary py-2 text-center text-[13px] font-bold text-white"
        >
          신청하러 가기
        </a>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2.5 block text-[14px] font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}
