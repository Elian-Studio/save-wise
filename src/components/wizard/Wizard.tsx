import { useState } from 'react';
import type { CalculatorApi } from '../../hooks/useCalculator';
import { bankRate } from '../../lib/calc';
import { BANKS } from '../../data/banks';
import { MAN, MIRAE, INCOME } from '../../data/products';
import { fmtMoney, pct, won2man } from '../../lib/format';
import { ShareButton } from '../ShareButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepBadge, Slider, Segments, ToggleCard, type SegOption } from './controls';

// Switch Advisor(Claude Design)의 스텝 위저드 UX를 실엔진(calc.ts) 위로 포팅.
// 핵심: 스텝을 조건부 언마운트하지 않고 전부 마운트한 채 hidden으로 활성만 표시 →
// 빌드 프리렌더가 모든 스텝 콘텐츠를 HTML에 박아 SEO(크롤) 유지. 계산은 전부 실엔진 값.

// 소득구간 세그먼트 → salary(만원). 대표값이 엔진 tier 경계와 맞아 계산상 정확.
const SALARY_SEGS: SegOption<number>[] = [
  { label: '2,400만원 이하', value: 2000, tag: '기여금 최대' },
  { label: '2,400~3,600만', value: 3000, tag: '저소득 우대' },
  { label: '3,600~4,800만', value: 4200, tag: '표준' },
  { label: '4,800~6,000만', value: 5400, tag: '표준' },
  { label: '6,000만원 초과', value: 7000, tag: '기여금 0' },
];
const LEAP_MONTHLY_SEGS: SegOption<number>[] = [30, 50, 70].map((v) => ({ label: `${v}만`, value: v }));
const MIRAE_MONTHLY_SEGS: SegOption<number>[] = [30, 40, 50].map((v) => ({ label: `${v}만`, value: v }));

type Military = 'none' | 'done' | 'doing';
const MILITARY_SEGS: SegOption<Military>[] = [
  { label: '해당 없음', value: 'none' },
  { label: '이행함', value: 'done' },
  { label: '복무 중', value: 'doing' },
];

// 가입 자격(연령) — 엔진 계산엔 안 들어가는 UI 표시용. 병역 이행 시 상한 +2(만 36).
function eligibility(age: number, salary: number, military: Military) {
  const maxAge = military === 'done' ? 36 : 34;
  const ageOk = age >= 19 && age <= maxAge;
  if (!ageOk)
    return {
      status: 'no' as const,
      icon: '⊘',
      title: '가입 어려움',
      desc: `만 ${age}세는 청년미래적금 연령요건(만 19~${maxAge}세)에서 벗어납니다. 도약계좌 유지가 유리할 수 있어요.`,
      maxAge,
    };
  if (salary > INCOME.joinCap)
    return {
      status: 'maybe' as const,
      icon: '◐',
      title: '추가 확인 필요',
      desc: `총급여 ${INCOME.joinCap.toLocaleString()}만원 초과 구간은 가구소득·세부요건에 따라 가입 여부가 갈립니다. 결과는 참고용으로 보세요.`,
      maxAge,
    };
  return {
    status: 'yes' as const,
    icon: '✓',
    title: '가입 가능',
    desc: '연령·소득 요건을 충족해 청년미래적금 가입 대상으로 보입니다. 다음 단계에서 전환 수령액을 비교해 드릴게요.',
    maxAge,
  };
}

const ELIG_STYLE: Record<string, string> = {
  yes: 'bg-fin-green-soft text-fin-green',
  maybe: 'bg-fin-amber-soft text-fin-amber',
  no: 'bg-[#fbeaec] text-[#b0202c]',
};

// 은행 선택 — 공용 Radix Select(흰색 popover·부드러운 드롭다운). OS 네이티브 select 대신.
// Radix는 빈 value item을 불허 → '없음'은 센티넬 __none으로 표현.
const NONE = '__none';
function BankSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-bold text-ink">{label}</span>
      <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? '' : v)}>
        <SelectTrigger aria-label={label} className="h-11 rounded-xl px-3 text-[14px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>없음 / 미선택</SelectItem>
          {BANKS.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
          <SelectItem value="etc">기타(미참여: 케이뱅크·토스 등)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Wizard({ api }: { api: CalculatorApi }) {
  const { inputs: I, setInput, birth, setBirth, leapStart, age, result: C, rec } = api;
  const isNew = I.scenario === 'new';
  const shareSummary = isNew
    ? `청년미래적금 예상 만기수령액 ${fmtMoney(C.mirae.total)} · 추천 ${C.bb.bank.name} ${pct(C.rMirae)} (내 조건 기준)`
    : `${rec.main} · 유지 ${fmtMoney(C.stay.total)} vs 미래적금 ${fmtMoney(C.mirae.total)}`;
  const [step, setStep] = useState(0); // 0=entry(보유 여부), 1~=콘텐츠 스텝
  const [military, setMilitary] = useState<Military>('none');
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  // 모드별 콘텐츠 스텝 목록(entry 제외). switch는 계좌 스텝 추가.
  const stepKeys = isNew ? ['basics', 'conditions', 'result'] : ['basics', 'account', 'conditions', 'result'];
  const stepLabels = isNew ? ['기본정보', '가입조건', '결과'] : ['기본정보', '현재계좌', '우대조건', '결과'];
  const lastStep = stepKeys.length; // step 인덱스: entry=0, 콘텐츠=1..stepKeys.length
  const cur = step === 0 ? 'entry' : stepKeys[step - 1];

  const birthYear = +birth.slice(0, 4);
  const setBirthYear = (y: number) => setBirth(`${y}-06-15`);
  const el = eligibility(age, I.salary, military);

  const goMode = (s: 'switch' | 'new') => {
    setInput('scenario', s);
    setStep(1);
    window.scrollTo({ top: 0 });
  };
  const next = () => {
    setStep((s) => (s < lastStep ? s + 1 : 0));
    window.scrollTo({ top: 0 });
  };
  const prev = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0 });
  };

  // 은행 TOP3 — 내 거래현황 기준 실제 적용금리순(실엔진 bankRate).
  const top3 = BANKS.map((b) => ({ b, ...bankRate(b, I) }))
    .sort((a, z) => z.r - a.r)
    .slice(0, 3);

  // verdict 색(실엔진 rec.verdict): switch=green / stay=navy / close=amber
  const vTone =
    rec.verdict === 'switch'
      ? 'from-fin-green to-[#0f6b32]'
      : rec.verdict === 'stay'
        ? 'from-navy to-navy2'
        : 'from-fin-amber to-[#92420a]';

  const CHECK_ITEMS = [
    { key: 'haeji', label: '기존 도약계좌 중도해지 조건 확인', sub: '해지 시 기여금·비과세 손해 여부' },
    { key: 'period', label: '청년미래적금 신청기간 확인', sub: '접수 일정·마감일 체크' },
    { key: 'open', label: '신규 계좌 개설 가능 기간', sub: '전환 공백 없이 개설 일정 잡기' },
    { key: 'woodae', label: '우대금리 조건 실제 충족 가능', sub: '급여이체·카드실적 유지 가능성' },
  ];
  const checkDone = CHECK_ITEMS.filter((c) => checks[c.key]).length;

  return (
    <div>
      {/* 스텝 네비 — entry 이후 노출 */}
      {step > 0 && (
        <nav aria-label="진행 단계" className="flex flex-wrap items-center gap-1.5 pt-5">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <button
                key={label}
                type="button"
                onClick={() => n < step && setStep(n)}
                disabled={n > step}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                  active ? 'bg-accent text-navy' : 'text-muted-foreground'
                } ${n > step ? 'cursor-default opacity-60' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    active
                      ? 'bg-primary text-white'
                      : done
                        ? 'bg-fin-green text-white'
                        : 'bg-line text-muted-foreground'
                  }`}
                >
                  {done ? '✓' : n}
                </span>
                <span className="text-[12.5px] font-bold">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 스텝 전환 시 높이 출렁임 방지: 입력 스텝(~646~649px, 사용자 측정)만큼 min-h 고정.
          entry(짧음)는 여백, result(큼)는 초과해 늘어남 → 입력 단계 간 이동에서 화면이 안 튄다. */}
      <div className="min-h-[660px] pt-6 pb-4">
        {/* STEP 0 — 진입: 도약계좌 보유 여부 */}
        <section hidden={cur !== 'entry'}>
          <div className="mx-auto max-w-[640px] py-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-navy">
              청년도약계좌, 미래적금으로 갈아타는 게 유리할까요?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              은행별 최고금리가 아니라 <b className="text-ink">내가 실제로 받을 금리</b> 기준으로 3분 안에 판단해
              드립니다.
            </p>
            <p className="mt-7 mb-4 text-[19px] font-extrabold text-navy">시작하기 · 도약계좌를 보유 중인가요?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => goMode('switch')}
                className="rounded-2xl border border-line bg-card p-6 text-left transition hover:border-primary hover:bg-accent"
              >
                <div className="text-2xl">🏦</div>
                <div className="mt-2 text-[16px] font-bold text-navy">보유 중 — 갈아탈지 비교</div>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  유지 vs 전환 결론 + 최적 은행을 찾아드려요.
                </div>
              </button>
              <button
                type="button"
                onClick={() => goMode('new')}
                className="rounded-2xl border border-line bg-card p-6 text-left transition hover:border-primary hover:bg-accent"
              >
                <div className="text-2xl">✨</div>
                <div className="mt-2 text-[16px] font-bold text-navy">미보유 — 신규 가입</div>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  미래적금 예상 수령액 + 최적 은행을 찾아드려요.
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* STEP — 기본정보 */}
        <section hidden={cur !== 'basics'}>
          <StepBadge>STEP 01 · 기본 정보</StepBadge>
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-navy">기본 정보를 알려주세요</h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="flex flex-col gap-6 rounded-2xl border border-line bg-card p-6">
              <div>
                <label className="mb-1 block text-[14px] font-bold text-ink">
                  출생 연도 <span className="font-normal text-muted-foreground">현재 만 {age}세</span>
                </label>
                <div className="flex items-center gap-4">
                  <Slider min={1988} max={2009} value={birthYear} onChange={setBirthYear} aria-label="출생 연도" />
                  <div className="min-w-16 text-right text-xl font-bold tabular-nums">{birthYear}</div>
                </div>
              </div>
              <div>
                <label className="mb-2.5 block text-[14px] font-bold text-ink">병역 이행 여부</label>
                <Segments options={MILITARY_SEGS} value={military} onChange={setMilitary} aria-label="병역 이행 여부" />
              </div>
              <div>
                <label className="mb-2.5 block text-[14px] font-bold text-ink">연 소득 구간</label>
                <Segments
                  options={SALARY_SEGS}
                  value={SALARY_SEGS.find((s) => s.value >= I.salary)?.value ?? 7000}
                  onChange={(v) => setInput('salary', v)}
                  cols={1}
                  aria-label="연 소득 구간"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-[14px] font-bold text-ink">중소기업 신규취업자(우대형 12%)</label>
                <Segments
                  options={[
                    { label: '해당', value: 'pref' },
                    { label: '해당 없음', value: 'gen' },
                  ]}
                  value={I.type}
                  onChange={(v) => setInput('type', v as 'pref' | 'gen')}
                  aria-label="우대형 자격"
                />
                <p className="mini">우대형은 납입액의 12%, 일반형은 6%를 정부가 매월 매칭합니다.</p>
              </div>
            </div>
            <aside className="rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-4">
              <div className="mb-3 text-[11.5px] font-bold tracking-wide text-muted-foreground">
                실시간 자격 진단 · LIVE
              </div>
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${ELIG_STYLE[el.status]}`}>
                <div className="text-2xl leading-none">{el.icon}</div>
                <div className="text-[16px] font-extrabold">{el.title}</div>
              </div>
              <p className="mt-3.5 text-[13px] leading-relaxed text-muted-foreground">{el.desc}</p>
            </aside>
          </div>
        </section>

        {/* STEP — 현재 계좌 (switch 전용, 프리렌더 기본모드라 크롤 포함) */}
        {!isNew && (
          <section hidden={cur !== 'account'}>
            <StepBadge>STEP 02 · 현재 도약계좌</StepBadge>
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-navy">
              지금 도약계좌, 어떻게 넣고 계세요?
            </h2>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
              <div className="flex flex-col gap-6 rounded-2xl border border-line bg-card p-6">
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label className="text-[14px] font-bold text-ink">납입 경과 개월</label>
                    <div className="text-[18px] font-bold tabular-nums text-primary">
                      {I.elapsed}
                      <span className="text-[12px] text-muted-foreground"> / 60개월</span>
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={59}
                    value={I.elapsed}
                    onChange={(v) => {
                      setInput('elapsed', v);
                      setInput('paidCount', v);
                    }}
                    aria-label="납입 경과 개월"
                  />
                  <p className="mini">만기까지 {C.remaining}개월 남았어요.</p>
                </div>
                <div>
                  <label className="mb-2.5 block text-[14px] font-bold text-ink">도약 월 납입액</label>
                  <Segments
                    options={LEAP_MONTHLY_SEGS}
                    value={won2man(I.leapMonthly)}
                    onChange={(v) => setInput('leapMonthly', v * MAN)}
                    aria-label="도약 월 납입액"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label className="text-[14px] font-bold text-ink">현재 적용 금리</label>
                    <div className="text-[18px] font-bold tabular-nums">{(I.leapRate * 100).toFixed(1)}%</div>
                  </div>
                  <Slider
                    min={3}
                    max={6}
                    step={0.1}
                    value={+(I.leapRate * 100).toFixed(1)}
                    onChange={(v) => setInput('leapRate', v / 100)}
                    aria-label="현재 적용 금리"
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-[14px] font-bold text-ink">전환 시 미래적금 월 납입액</label>
                  <Segments
                    options={MIRAE_MONTHLY_SEGS}
                    value={won2man(I.miraeMonthly)}
                    onChange={(v) => setInput('miraeMonthly', v * MAN)}
                    aria-label="미래적금 월 납입액"
                  />
                </div>
              </div>
              <aside className="rounded-2xl bg-gradient-to-br from-navy to-navy2 p-6 text-white lg:sticky lg:top-4">
                <div className="text-[11.5px] font-bold tracking-wide opacity-70">만기 예상 (유지 시) · LIVE</div>
                <div className="mt-1 text-[28px] font-extrabold tabular-nums">{fmtMoney(C.stay.total)}</div>
                <div className="mt-4 flex flex-col gap-2 text-[13px]">
                  <Row k="납입 원금" v={fmtMoney(C.stay.principal)} />
                  <Row k="정부기여금" v={`+${fmtMoney(C.stay.contrib)}`} />
                  <Row k="비과세 이자" v={`+${fmtMoney(C.stay.interest)}`} />
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* STEP — 우대조건 / 가입조건 */}
        <section hidden={cur !== 'conditions'}>
          <StepBadge>{isNew ? 'STEP 02 · 가입 조건' : 'STEP 03 · 우대 조건'}</StepBadge>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-navy">실제로 채울 수 있는 조건만 켜주세요</h2>
          <p className="mb-6 text-[14px] text-muted-foreground">
            최고금리는 모든 조건을 다 채워야 받는 숫자예요. <b className="text-ink">정말 달성 가능한 것</b>만 선택하면
            현실 금리로 은행을 추천합니다.
          </p>
          <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="flex flex-col gap-5">
              {isNew && (
                <div className="rounded-2xl border border-line bg-card p-5">
                  <label className="mb-2.5 block text-[14px] font-bold text-ink">미래적금 월 납입액</label>
                  <Segments
                    options={MIRAE_MONTHLY_SEGS}
                    value={won2man(I.miraeMonthly)}
                    onChange={(v) => setInput('miraeMonthly', v * MAN)}
                    aria-label="미래적금 월 납입액"
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <BankSelect label="주거래 은행" value={I.mainBank} onChange={(v) => setInput('mainBank', v)} />
                <BankSelect label="급여이체 은행" value={I.payBank} onChange={(v) => setInput('payBank', v)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ToggleCard
                  on={I.cardSpend}
                  onToggle={() => setInput('cardSpend', !I.cardSpend)}
                  icon="💳"
                  label="카드 실적"
                  desc="주거래 은행 카드로 월 실적 충족 가능"
                />
                <ToggleCard
                  on={I.autoTransfer}
                  onToggle={() => setInput('autoTransfer', !I.autoTransfer)}
                  icon="🔁"
                  label="자동이체"
                  desc="급여/공과금 자동이체 등 주거래 조건 충족"
                />
                <ToggleCard
                  on={I.advisory}
                  onToggle={() => setInput('advisory', !I.advisory)}
                  icon="📋"
                  label="재무상담 이수"
                  desc="서민금융진흥원 청년 재무상담 +0.2%p"
                />
              </div>
            </div>
            <aside className="rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-4">
              <div className="mb-2 text-[11.5px] font-bold tracking-wide text-muted-foreground">
                내 조건 기준 최적 은행 · LIVE
              </div>
              <div className="text-[18px] font-extrabold text-navy">{C.bb.bank.name}</div>
              <div className="mt-1 text-[26px] font-extrabold tabular-nums text-fin-green">{pct(C.bb.r)}</div>
              <div className="mini">
                {C.bb.tier} (우대 +{(C.bb.pref * 100).toFixed(1)}%p)
              </div>
            </aside>
          </div>
        </section>

        {/* STEP — 결과 */}
        <section hidden={cur !== 'result'}>
          <StepBadge>{isNew ? 'STEP 03 · 결과' : 'STEP 04 · 진단 결과'}</StepBadge>
          {isNew ? (
            <div className={`rounded-2xl bg-gradient-to-br from-fin-green to-[#0f6b32] p-7 text-white`}>
              <p className="text-[13px] opacity-85">
                {C.bb.bank.name} · 월 {fmtMoney(I.miraeMonthly)} · {MIRAE.termMonths / 12}년 만기 기준
              </p>
              <p className="my-1.5 text-[28px] font-extrabold tracking-tight">
                만기 예상 수령액 {fmtMoney(C.mirae.total)}
              </p>
              <p className="text-sm opacity-95">
                원금 <b>{fmtMoney(C.mirae.principal)}</b> + 정부기여금 <b>{fmtMoney(C.mirae.contrib)}</b> + 이자{' '}
                <b>{fmtMoney(C.mirae.interest)}</b> (비과세) · 적용금리 <b>{pct(C.rMirae)}</b>
              </p>
            </div>
          ) : (
            <>
              {/* verdict hero — 실엔진 rec */}
              <section className={`rounded-2xl bg-gradient-to-br ${vTone} p-7 text-white`}>
                <div className="flex flex-wrap items-start gap-5">
                  <div className="text-5xl leading-none">
                    {rec.verdict === 'switch' ? '🚀' : rec.verdict === 'stay' ? '🛡️' : '⚖️'}
                  </div>
                  <div className="min-w-[240px] flex-1">
                    <div className="text-[13px] font-bold opacity-70">최종 판단 · RECOMMENDATION</div>
                    <h3 className="my-1.5 text-[30px] font-extrabold tracking-tight">{rec.main}</h3>
                    <ul className="mt-2 grid gap-1.5">
                      {rec.reasons.map((r, i) => (
                        <li key={i} className="rounded-lg bg-white/15 px-3 py-1.5 text-[13.5px]">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-white/25 bg-white/15 px-5 py-4 text-center">
                    <div className="text-[11.5px] font-bold opacity-80">같은 돈 3년 기준</div>
                    <div className="text-[22px] font-extrabold tabular-nums">
                      {C.diff3yr >= 0 ? '+' : '−'}
                      {fmtMoney(Math.abs(C.diff3yr))}
                    </div>
                    <div className="text-[11px] opacity-75">{C.diff3yr >= 0 ? '전환 우위' : '유지 우위'}</div>
                  </div>
                </div>
              </section>

              {/* 비교 — 공정 기준(같은 월납입·같은 3년). 만기·한도 차이를 보정해 verdict와 일치시킴 */}
              <section className="mt-4 rounded-2xl border border-line bg-card p-6">
                <div className="text-[17px] font-extrabold">같은 돈·같은 기간(3년) 비교</div>
                <div className="mb-4 text-[12.5px] text-muted-foreground">
                  월 같은 금액을 3년간 넣었다고 보고, 만기·납입한도 차이를 보정한 공정 비교예요.
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                  <CompareCol
                    title="도약계좌 유지 (3년 환산)"
                    total={C.leap36.total}
                    contrib={C.leap36.contrib}
                    interest={C.leap36.interest}
                    win={C.diff3yr <= 0}
                    tone="navy"
                  />
                  <div className="flex items-center justify-center text-[20px] font-bold text-muted-foreground">vs</div>
                  <CompareCol
                    title={`미래적금 전환 (${C.bank.name})`}
                    total={C.mirae36.total}
                    contrib={C.mirae36.contrib}
                    interest={C.mirae36.interest}
                    win={C.diff3yr > 0}
                    tone="green"
                  />
                </div>
                {/* 참고: 각 상품 만기까지 — 강등(작게·muted). 큰 볼드 숫자로 경쟁시키지 않음 */}
                <div className="mt-4 rounded-xl bg-secondary px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
                  참고 · 각 상품 만기까지 채우면 — 도약 유지({C.nStay}개월){' '}
                  <b className="tabular-nums text-ink">{fmtMoney(C.stay.total)}</b>, 미래적금({MIRAE.termMonths}개월){' '}
                  <b className="tabular-nums text-ink">{fmtMoney(C.mirae.total)}</b>. 납입기간·한도가 달라 두 만기액의
                  단순 비교는 의미가 작습니다.
                </div>
              </section>
            </>
          )}

          {/* 은행 TOP3 (실엔진 금리순) + 체크리스트 */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
            <section className="rounded-2xl border border-line bg-card p-6">
              <div className="text-[17px] font-extrabold">은행 추천 TOP 3</div>
              <div className="mb-4 text-[12.5px] text-muted-foreground">내 조건 기준 실수령 우대금리순</div>
              <div className="flex flex-col gap-3">
                {top3.map((x, i) => (
                  <div
                    key={x.b.id}
                    className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
                      i === 0 ? 'border-primary bg-accent' : 'border-line bg-card'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[14px] font-extrabold text-white ${
                        i === 0 ? 'bg-fin-amber' : i === 1 ? 'bg-[#9aa6bc]' : 'bg-[#b97f50]'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 font-bold">{x.b.name}</div>
                    <div className="text-right">
                      <div className="text-[19px] font-extrabold tabular-nums text-primary">{pct(x.r)}</div>
                      <div className="text-[10.5px] text-muted-foreground">우대 +{(x.pref * 100).toFixed(1)}%p</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-card p-6">
              <div className="text-[17px] font-extrabold">{isNew ? '가입 전 확인사항' : '전환 전 확인사항'}</div>
              <div className="mb-3 mt-2 flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-fin-green transition-all"
                    style={{ width: `${(checkDone / CHECK_ITEMS.length) * 100}%` }}
                  />
                </div>
                <div className="text-[13px] font-bold tabular-nums text-fin-green">
                  {checkDone}/{CHECK_ITEMS.length}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {CHECK_ITEMS.map((c) => {
                  const on = !!checks[c.key];
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                        on ? 'border-fin-green bg-fin-green-soft' : 'border-line bg-card'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border text-[12px] font-bold text-white ${
                          on ? 'border-fin-green bg-fin-green' : 'border-line'
                        }`}
                      >
                        {on ? '✓' : ''}
                      </span>
                      <span>
                        <span
                          className={`text-[13.5px] font-bold ${on ? 'text-muted-foreground line-through' : 'text-ink'}`}
                        >
                          {c.label}
                        </span>
                        <span className="block text-[11.5px] text-muted-foreground">{c.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <ShareButton state={{ inputs: I, leapStart }} summary={shareSummary} />

          <p className="mt-5 text-[11.5px] leading-relaxed text-muted-foreground">
            ※ 입력값 기반 추정치이며 실제 상품 조건·세제 혜택과 다를 수 있습니다. 가입·해지 전 반드시 해당 금융기관에
            확인하세요.
          </p>
        </section>
      </div>

      {/* 푸터 네비 */}
      {step > 0 && (
        <div className="flex items-center justify-between gap-4 pb-2">
          <button
            type="button"
            onClick={prev}
            className="min-h-11 rounded-xl border border-line bg-card px-5 font-bold text-muted-foreground"
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
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-75">{k}</span>
      <b className="tabular-nums">{v}</b>
    </div>
  );
}

function CompareCol({
  title,
  total,
  contrib,
  interest,
  win,
  tone,
}: {
  title: string;
  total: number;
  contrib: number;
  interest: number;
  win: boolean;
  tone: 'navy' | 'green';
}) {
  const border = win
    ? tone === 'green'
      ? 'border-fin-green bg-fin-green-soft'
      : 'border-primary bg-accent'
    : 'border-line bg-secondary';
  return (
    <div className={`rounded-xl border p-5 ${border}`}>
      <div className={`text-[13px] font-bold ${tone === 'green' ? 'text-fin-green' : 'text-navy'}`}>{title}</div>
      <div className="mt-2 text-[24px] font-extrabold tabular-nums">{fmtMoney(total)}</div>
      <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-muted-foreground">
        <div className="flex justify-between">
          <span>기여금</span>
          <b className="tabular-nums text-ink">+{fmtMoney(contrib)}</b>
        </div>
        <div className="flex justify-between">
          <span>이자</span>
          <b className="tabular-nums text-ink">+{fmtMoney(interest)}</b>
        </div>
      </div>
    </div>
  );
}
