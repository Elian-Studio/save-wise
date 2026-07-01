import { useMemo, useState } from 'react';
import { Slider, Segments, type SegOption } from '../../components/wizard/controls';
import { DATA_AS_OF } from '../../data/transitCards';
import type { AgeTier, CardType } from '../../data/transitCards';
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

export function Transit() {
  const [region, setRegion] = useState<Region>('seoul');
  const [transit, setTransit] = useState<TransitMode>('bs');
  const [age, setAge] = useState<AgeTier>('general');
  const [fare, setFare] = useState(75000);
  const [cardType, setCardType] = useState<CardType>('credit');

  const cmp = useMemo(() => compare(fare, age, region, transit), [fare, age, region, transit]);
  const ranked = useMemo(() => rankCards(fare, cardType), [fare, cardType]);
  const best = ranked[0];

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
        <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground">
          2026 K-패스는 <b className="text-ink">모두의카드</b>(정액제·초과분 전액환급)로 바뀌어, 대부분{' '}
          <b className="text-ink">K-패스가 기후동행보다 유리</b>합니다. 그럼 <b className="text-ink">어느 카드사</b>가
          가장 좋을까요? 내 조건으로 찾아드립니다.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* 입력 */}
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
          </div>

          {/* K-패스 요약 (실엔진) */}
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
        </div>

        {/* 카드 추천 순위 — 메인 */}
        <section className="mt-6 rounded-2xl border border-line bg-card p-6">
          <div className="text-[17px] font-extrabold">
            내 조건 K-패스 {cardType === 'credit' ? '신용' : '체크'}카드 추천
          </div>
          <div className="mb-4 text-[12.5px] text-muted-foreground">
            월 교통비 {won(fare)} 기준, 카드 추가절감 − 연회비(월환산) 순 · 전월실적 충족 가정
          </div>
          <div className="flex flex-col gap-3">
            {ranked.map((r, i) => (
              <div
                key={r.card.id}
                className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
                  i === 0 ? 'border-fin-green bg-fin-green-soft' : 'border-line bg-card'
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[14px] font-extrabold text-white ${
                    i === 0 ? 'bg-fin-green' : i === 1 ? 'bg-[#9aa6bc]' : i === 2 ? 'bg-[#b97f50]' : 'bg-line'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold">{r.card.issuer}</span>
                    <span className="text-[13px] text-muted-foreground">{r.card.name}</span>
                    {r.card.grade === 'press' && (
                      <span className="rounded bg-fin-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-fin-amber">
                        확인필요
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    연회비 {r.card.annualFee === 0 ? '없음' : won(r.card.annualFee)} · 전월실적{' '}
                    {r.card.minPrevSpend === 0 ? '없음' : `${r.card.minPrevSpend / 10000}만↑`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-extrabold tabular-nums text-fin-green">
                    +{won(r.add)}
                    <span className="text-[11px] font-normal text-muted-foreground">/월</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {best && (
            <div className="mt-4 rounded-xl bg-secondary px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
              💡 지금 조건이면 <b className="text-ink">{best.card.issuer} {best.card.name}</b>가 K-패스 환급 위에 월{' '}
              <b className="text-fin-green">{won(best.add)}</b>을 더 아껴줘요.
            </div>
          )}
        </section>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2.5 block text-[14px] font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}
