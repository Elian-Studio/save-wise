import { useId, type ReactNode } from 'react';
import { BANKS, getBank, NON_PARTICIPATING_NOTE } from '../data/banks';
import { MAN } from '../data/products';
import { fmtMoney, pct, won2man } from '../lib/format';
import { readNumberInput } from '../lib/num';
import type { CalculatorApi } from '../hooks/useCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NONE = '__none';

function bracketName(s: number): string {
  if (s <= 2400) return '2,400만원 이하 (기여금 매칭률 최고)';
  if (s <= 3600) return '2,400~3,600만원';
  if (s <= 4800) return '3,600~4,800만원';
  if (s <= 6000) return '4,800~6,000만원';
  if (s <= 7500) return '6,000~7,500만원 (도약 기여금 0·비과세만)';
  return '7,500만원 초과 (가입 불가 구간)';
}

function CardTitle({ children }: { children: ReactNode }) {
  return <p className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-navy">{children}</p>;
}

/** 라벨-입력 연결: useId로 id를 만들어 Label htmlFor + children(id)으로 입력에 부여 */
function Field({
  label,
  hint,
  children,
  foot,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: (id: string) => ReactNode;
  foot?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="mb-3.5 last:mb-0">
      <Label htmlFor={id} className="mb-1.5 block">
        {label} {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children(id)}
      {foot}
    </div>
  );
}

function Check({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-md border border-input p-2.5 text-[13.5px]"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span>{children}</span>
    </label>
  );
}

function MainBankSelect({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value || NONE} onValueChange={(v) => onChange(v === NONE ? '' : v)}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>없음</SelectItem>
        {BANKS.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name} {b.grp === 3 ? '(최고8%)' : '(최고7%)'}
          </SelectItem>
        ))}
        <SelectItem value="etc">기타 (미참여 은행: 케이뱅크·토스 등)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function InputsPanel({ api }: { api: CalculatorApi }) {
  const { inputs: I, setInput, birth, setBirth, leapStart, setLeapStart, age, result: C } = api;
  const ageOk = age >= 19 && age <= 34;
  const cardCo = getBank(I.cardCo);

  return (
    <>
      <h2 className="sec">1. 내 상황 입력</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 공통 */}
        <Card>
          <CardContent className="pt-5">
            <CardTitle>👤 공통</CardTitle>
            <Field
              label="생년월일"
              hint="(병역기간 최대 6년 제외)"
              foot={
                <div className="mini">
                  만 <b>{age}세</b> · 가입연령(만 19~34){' '}
                  {ageOk ? '충족' : <span className="text-fin-amber">초과 — 병역기간만큼 차감 시 가능할 수 있음</span>}
                </div>
              }
            >
              {(id) => (
                <Input
                  id={id}
                  type="date"
                  value={birth}
                  min="1986-01-01"
                  max="2010-12-31"
                  autoComplete="off"
                  onChange={(e) => setBirth(e.target.value)}
                />
              )}
            </Field>
            <Field label="연 총급여" hint="(만원)" foot={<div className="mini">소득구간: {bracketName(I.salary)}</div>}>
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={I.salary}
                  min={0}
                  step={100}
                  autoComplete="off"
                  onChange={(e) => setInput('salary', readNumberInput(e))}
                />
              )}
            </Field>
            <Field label="저축 목적">
              {(id) => (
                <Select value={I.goal} onValueChange={(v) => setInput('goal', v as 'amount' | 'liquid')}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">목돈 최대화</SelectItem>
                    <SelectItem value="liquid">유동성·짧은 만기 선호</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
            <Field label="주거래 은행" hint="(주로 쓰는 은행)">
              {(id) => <MainBankSelect id={id} value={I.mainBank} onChange={(v) => setInput('mainBank', v)} />}
            </Field>
            <Field
              label="월급(급여이체) 은행"
              hint="(급여 받는 은행)"
              foot={
                <div className="mini">
                  {I.payBank === 'etc'
                    ? '월급 은행이 미참여 → 급여이체 우대를 받으려면 참여 은행으로 급여이체 이전이 필요합니다.'
                    : '급여이체 은행 + 자동이체 충족 시 그 은행 ‘최대 우대’ 적용'}
                </div>
              }
            >
              {(id) => <MainBankSelect id={id} value={I.payBank} onChange={(v) => setInput('payBank', v)} />}
            </Field>
          </CardContent>
        </Card>

        {/* 도약계좌 */}
        <Card>
          <CardContent className="pt-5">
            <CardTitle>
              🏦 청년도약계좌 <Badge variant="blue">현재 보유</Badge>
            </CardTitle>
            <Field
              label="가입 시기"
              foot={
                <div className="mini">
                  경과 {I.elapsed}개월 · 만기까지 {C.remaining}개월
                </div>
              }
            >
              {(id) => (
                <Input
                  id={id}
                  type="month"
                  value={leapStart}
                  autoComplete="off"
                  onChange={(e) => setLeapStart(e.target.value)}
                />
              )}
            </Field>
            <Field label="그동안 회당(월) 납입액" hint="(만원, 최대 70)">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={won2man(I.leapMonthly)}
                  min={0}
                  max={70}
                  autoComplete="off"
                  onChange={(e) => setInput('leapMonthly', readNumberInput(e) * MAN)}
                />
              )}
            </Field>
            <Field
              label="그동안 납입 횟수"
              hint="(회)"
              foot={
                <div className="mini">
                  {I.paidCount > I.elapsed ? (
                    <span className="text-fin-amber">
                      ⚠ 가입 경과({I.elapsed}개월)보다 납입 횟수가 많습니다 — 확인해 주세요.
                    </span>
                  ) : (
                    '자유적립식이라 매월 납입하지 않았다면 실제 횟수를 입력하세요.'
                  )}
                </div>
              }
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={I.paidCount}
                  min={0}
                  max={60}
                  autoComplete="off"
                  onChange={(e) => setInput('paidCount', Math.max(0, Math.min(60, readNumberInput(e))))}
                />
              )}
            </Field>
            <div className="mb-3.5 rounded-lg bg-muted px-3 py-2.5 text-[13px] text-muted-foreground">
              그동안 납입한 총 원금 <b className="text-lg text-fin-blue">{fmtMoney(C.totalPaid)}</b>
              <div className="mini">
                회당 {won2man(I.leapMonthly)}만원 × {C.k}회
              </div>
            </div>
            <Field
              label="현재 적용 금리"
              hint="(%, 기본+우대)"
              foot={<div className="mini">최초 3년 고정 → 이후 1년마다 변동(보도: 변동분 4.5%→3.0%대 하락)</div>}
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={+(I.leapRate * 100).toFixed(2)}
                  min={0}
                  max={6}
                  step={0.1}
                  autoComplete="off"
                  onChange={(e) => setInput('leapRate', readNumberInput(e) / 100)}
                />
              )}
            </Field>
          </CardContent>
        </Card>

        {/* 미래적금 */}
        <Card>
          <CardContent className="pt-5">
            <CardTitle>
              ✨ 청년미래적금 <Badge variant="blue">전환 대상</Badge>
            </CardTitle>
            <Field label="월 납입액" hint="(만원, 최대 50)">
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={won2man(I.miraeMonthly)}
                  min={0}
                  max={50}
                  autoComplete="off"
                  onChange={(e) => setInput('miraeMonthly', readNumberInput(e) * MAN)}
                />
              )}
            </Field>
            <div className="mb-3.5">
              <Check id="advisory" checked={I.advisory} onChange={(v) => setInput('advisory', v)}>
                서민금융진흥원 ‘청년 재무상담’ 이수{' '}
                <span className="mt-0.5 block text-xs text-muted-foreground">전 은행 공통 +0.2%p</span>
              </Check>
            </div>
            <Field
              label="가정 투자 연수익률"
              hint="(%, 비보장)"
              foot={<div className="mini">아래 ‘투자 대비’ 비교에 쓰입니다.</div>}
            >
              {(id) => (
                <Input
                  id={id}
                  type="number"
                  value={+(I.investReturn * 100).toFixed(1)}
                  min={0}
                  max={30}
                  step={0.5}
                  autoComplete="off"
                  onChange={(e) => setInput('investReturn', readNumberInput(e) / 100)}
                />
              )}
            </Field>
            <div className="rounded-[10px] border border-[#bfe3c9] bg-fin-green-soft px-[15px] py-3 text-[13.5px]">
              내 거래현황 기준 <b className="text-fin-green">최적 은행</b>
              <br />
              <b className="text-base">
                {C.bb.bank.name} · {pct(C.bb.r)}
              </b>
              <div className="mini">
                {C.bb.tier} (우대 +{(C.bb.pref * 100).toFixed(1)}%p)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 우대형 자가진단 */}
      <Card className="mt-4">
        <CardContent className="pt-5">
          <CardTitle>🎯 정부기여금 유형 — 우대형(12%) 자격 자가진단</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Check id="smeNew" checked={I.type === 'pref'} onChange={(v) => setInput('type', v ? 'pref' : 'gen')}>
              <b>중소기업 신규취업자</b>에 해당
              <span className="mt-0.5 block text-xs text-muted-foreground">
                전년도(2025.1~12) 최초 취업 + 현재 중소기업 재직. 생애최초가 아니어도 해당 기업 취업 전 고용보험 합산
                1년 미만이면 인정.
              </span>
            </Check>
            <div className="flex items-center rounded-xl bg-muted p-4">
              <div>
                현재 적용 유형:{' '}
                <span className="text-[15px] font-bold text-fin-green">
                  {I.type === 'pref' ? '우대형 (납입액의 12%)' : '일반형 (납입액의 6%)'}
                </span>
                <div className="mini">일반형은 납입액의 6%, 우대형은 12%를 정부가 매월 매칭 지급합니다.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카드·자동이체 매칭 */}
      <Card className="mt-4">
        <CardContent className="pt-5">
          <CardTitle>💳 카드·자동이체 — 은행별 우대금리 매칭용</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="주 사용 카드사">
              {(id) => (
                <>
                  <Select value={I.cardCo || NONE} onValueChange={(v) => setInput('cardCo', v === NONE ? '' : v)}>
                    <SelectTrigger id={id}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>없음</SelectItem>
                      {BANKS.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                          {b.cardPref != null ? ` (카드우대 +${(b.cardPref * 100).toFixed(1)}%p)` : ' (우대 미공시)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cardCo && cardCo.cardPref != null ? (
                    <div className="mt-2">
                      <Check id="cardSpend" checked={I.cardSpend} onChange={(v) => setInput('cardSpend', v)}>
                        실적 조건 충족 가능 → 카드 우대 +{(cardCo.cardPref * 100).toFixed(1)}%p
                        <span className="mt-0.5 block text-xs text-muted-foreground">충족 조건: {cardCo.cardCond}</span>
                      </Check>
                    </div>
                  ) : (
                    <div className="mini">
                      {cardCo
                        ? `${cardCo.name}는 카드 우대조건이 공시되지 않아 카드 우대를 반영하지 않습니다(가입 은행에서 직접 확인 필요).`
                        : '카드사를 선택하면 해당 카드의 실적 조건과 우대 폭(%p)이 표시됩니다.'}
                    </div>
                  )}
                </>
              )}
            </Field>
            <Field label="적금 자동이체">
              {() => (
                <Check id="autoTransfer" checked={I.autoTransfer} onChange={(v) => setInput('autoTransfer', v)}>
                  월급/주거래 은행으로 자동이체 등 주거래 조건 충족 가능
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    충족 시 그 은행의 기관 최대 우대(3%p/2%p)까지 적용
                  </span>
                </Check>
              )}
            </Field>
          </div>
          <p className="mini mt-1.5">
            {NON_PARTICIPATING_NOTE} 카드 우대는 카드고릴라 공시 5개 은행(IBK·NH·신한·우리·하나)만 확정값입니다.
          </p>
        </CardContent>
      </Card>

      {/* 전환 대상 은행 선택 */}
      <Card className="mt-4">
        <CardContent className="pt-5">
          <CardTitle>🎚️ 전환 대상 은행</CardTitle>
          <div className="flex flex-wrap items-center gap-3.5">
            <Tabs value={I.bankMode} onValueChange={(v) => setInput('bankMode', v as 'auto' | 'manual')}>
              <TabsList aria-label="전환 대상 은행 선택 방식">
                <TabsTrigger value="auto">자동(최적)</TabsTrigger>
                <TabsTrigger value="manual">수동 선택</TabsTrigger>
              </TabsList>
            </Tabs>
            {I.bankMode === 'manual' && (
              <div className="w-[240px]">
                <Select value={I.manualBank || NONE} onValueChange={(v) => setInput('manualBank', v === NONE ? '' : v)}>
                  <SelectTrigger aria-label="전환 대상 은행 선택">
                    <SelectValue placeholder="은행 선택…" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} {b.grp === 3 ? '(최고8%)' : '(최고7%)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="mini flex-1">
              전환 패널·결론은 <b>{C.bank.name}</b> ({pct(C.rMirae)}) 기준으로 계산됩니다.
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
