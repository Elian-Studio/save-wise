import { BANKS, getBank, NON_PARTICIPATING_NOTE } from '../data/banks';
import { MAN } from '../data/products';
import { fmtMoney, pct, won2man } from '../lib/format';
import type { CalculatorApi } from '../hooks/useCalculator';

function bracketName(s: number): string {
  if (s <= 2400) return '2,400만원 이하 (기여금 매칭률 최고)';
  if (s <= 3600) return '2,400~3,600만원';
  if (s <= 4800) return '3,600~4,800만원';
  if (s <= 6000) return '4,800~6,000만원';
  if (s <= 7500) return '6,000~7,500만원 (도약 기여금 0·비과세만)';
  return '7,500만원 초과 (가입 불가 구간)';
}

// 참여 14개 은행 + 없음 + 기타(미참여)
const bankOptions = (
  <>
    <option value="">없음</option>
    {BANKS.map((b) => (
      <option key={b.id} value={b.id}>
        {b.name} {b.grp === 3 ? '(최고8%)' : '(최고7%)'}
      </option>
    ))}
    <option value="etc">기타 (미참여 은행: 케이뱅크·토스 등)</option>
  </>
);

export function InputsPanel({ api }: { api: CalculatorApi }) {
  const { inputs: I, setInput, birth, setBirth, leapStart, setLeapStart, age, result: C } = api;
  const ageOk = age >= 19 && age <= 34;
  const cardCo = getBank(I.cardCo);

  return (
    <>
      <h2 className="sec">1. 내 상황 입력</h2>
      <div className="grid cols3">
        {/* 공통 */}
        <div className="card">
          <p className="card-title">👤 공통</p>
          <div className="field">
            <label>
              생년월일 <span className="hint">(병역기간 최대 6년 제외)</span>
            </label>
            <input
              type="date"
              value={birth}
              min="1986-01-01"
              max="2010-12-31"
              autoComplete="off"
              onChange={(e) => setBirth(e.target.value)}
            />
            <div className="mini">
              만 <b>{age}세</b> · 가입연령(만 19~34){' '}
              {ageOk ? '충족' : <span className="warn-text">초과 — 병역기간만큼 차감 시 가능할 수 있음</span>}
            </div>
          </div>
          <div className="field">
            <label>
              연 총급여 <span className="hint">(만원)</span>
            </label>
            <input
              type="number"
              value={I.salary}
              min={0}
              step={100}
              autoComplete="off"
              onChange={(e) => setInput('salary', Number(e.target.value) || 0)}
            />
            <div className="mini">소득구간: {bracketName(I.salary)}</div>
          </div>
          <div className="field">
            <label>저축 목적</label>
            <select value={I.goal} onChange={(e) => setInput('goal', e.target.value as 'amount' | 'liquid')}>
              <option value="amount">목돈 최대화</option>
              <option value="liquid">유동성·짧은 만기 선호</option>
            </select>
          </div>
          <div className="field">
            <label>
              주거래 은행 <span className="hint">(주로 쓰는 은행)</span>
            </label>
            <select value={I.mainBank} onChange={(e) => setInput('mainBank', e.target.value)}>
              {bankOptions}
            </select>
          </div>
          <div className="field">
            <label>
              월급(급여이체) 은행 <span className="hint">(급여 받는 은행)</span>
            </label>
            <select value={I.payBank} onChange={(e) => setInput('payBank', e.target.value)}>
              {bankOptions}
            </select>
            <div className="mini">
              {I.payBank === 'etc'
                ? '월급 은행이 미참여 → 급여이체 우대를 받으려면 참여 은행으로 급여이체 이전이 필요합니다.'
                : '급여이체 은행 + 자동이체 충족 시 그 은행 ‘최대 우대’ 적용'}
            </div>
          </div>
        </div>

        {/* 도약계좌 */}
        <div className="card">
          <p className="card-title">
            🏦 청년도약계좌 <span className="chip">현재 보유</span>
          </p>
          <div className="field">
            <label>가입 시기</label>
            <input type="month" value={leapStart} autoComplete="off" onChange={(e) => setLeapStart(e.target.value)} />
            <div className="mini">
              경과 {I.elapsed}개월 · 만기까지 {C.remaining}개월
            </div>
          </div>
          <div className="field">
            <label>
              그동안 회당(월) 납입액 <span className="hint">(만원, 최대 70)</span>
            </label>
            <input
              type="number"
              value={won2man(I.leapMonthly)}
              min={0}
              max={70}
              autoComplete="off"
              onChange={(e) => setInput('leapMonthly', (Number(e.target.value) || 0) * MAN)}
            />
          </div>
          <div className="field">
            <label>
              그동안 납입 횟수 <span className="hint">(회)</span>
            </label>
            <input
              type="number"
              value={I.paidCount}
              min={0}
              max={60}
              autoComplete="off"
              onChange={(e) => setInput('paidCount', Math.max(0, Math.min(60, Number(e.target.value) || 0)))}
            />
            <div className="mini">
              {I.paidCount > I.elapsed ? (
                <span className="warn-text">
                  ⚠ 가입 경과({I.elapsed}개월)보다 납입 횟수가 많습니다 — 확인해 주세요.
                </span>
              ) : (
                '자유적립식이라 매월 납입하지 않았다면 실제 횟수를 입력하세요.'
              )}
            </div>
          </div>
          <div className="eff" style={{ margin: '0 0 14px' }}>
            그동안 납입한 총 원금{' '}
            <b className="bignum blue" style={{ fontSize: 18 }}>
              {fmtMoney(C.totalPaid)}
            </b>
            <div className="mini" style={{ marginTop: 2 }}>
              회당 {won2man(I.leapMonthly)}만원 × {C.k}회
            </div>
          </div>
          <div className="field">
            <label>
              현재 적용 금리 <span className="hint">(%, 기본+우대)</span>
            </label>
            <input
              type="number"
              value={+(I.leapRate * 100).toFixed(2)}
              min={0}
              max={6}
              step={0.1}
              autoComplete="off"
              onChange={(e) => setInput('leapRate', (Number(e.target.value) || 0) / 100)}
            />
            <div className="mini">최초 3년 고정 → 이후 1년마다 변동(보도: 변동분 4.5%→3.0%대 하락)</div>
          </div>
        </div>

        {/* 미래적금 */}
        <div className="card">
          <p className="card-title">
            ✨ 청년미래적금 <span className="chip">전환 대상</span>
          </p>
          <div className="field">
            <label>
              월 납입액 <span className="hint">(만원, 최대 50)</span>
            </label>
            <input
              type="number"
              value={won2man(I.miraeMonthly)}
              min={0}
              max={50}
              autoComplete="off"
              onChange={(e) => setInput('miraeMonthly', (Number(e.target.value) || 0) * MAN)}
            />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label className="check">
              <input type="checkbox" checked={I.advisory} onChange={(e) => setInput('advisory', e.target.checked)} />
              <span>
                서민금융진흥원 ‘청년 재무상담’ 이수 <span className="ck-sub">전 은행 공통 +0.2%p</span>
              </span>
            </label>
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label>
              가정 투자 연수익률 <span className="hint">(%, 비보장)</span>
            </label>
            <input
              type="number"
              value={+(I.investReturn * 100).toFixed(1)}
              min={0}
              max={30}
              step={0.5}
              autoComplete="off"
              onChange={(e) => setInput('investReturn', (Number(e.target.value) || 0) / 100)}
            />
            <div className="mini">아래 ‘투자 대비’ 비교에 쓰입니다.</div>
          </div>
          <div className="bestbox">
            내 거래현황 기준 <b>최적 은행</b>
            <br />
            <b style={{ fontSize: 16 }}>
              {C.bb.bank.name} · {pct(C.bb.r)}
            </b>
            <div className="mini" style={{ marginTop: 2 }}>
              {C.bb.tier} (우대 +{(C.bb.pref * 100).toFixed(1)}%p)
            </div>
          </div>
        </div>
      </div>

      {/* 우대형 자가진단 */}
      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title">🎯 정부기여금 유형 — 우대형(12%) 자격 자가진단</p>
        <div className="grid cols2">
          <label className="check">
            <input
              type="checkbox"
              checked={I.type === 'pref'}
              onChange={(e) => setInput('type', e.target.checked ? 'pref' : 'gen')}
            />
            <span>
              <b>중소기업 신규취업자</b>에 해당
              <span className="ck-sub">
                전년도(2025.1~12) 최초 취업 + 현재 중소기업 재직. 생애최초가 아니어도 해당 기업 취업 전 고용보험 합산
                1년 미만이면 인정.
              </span>
            </span>
          </label>
          <div
            className="card"
            style={{ background: '#f6f8fc', boxShadow: 'none', display: 'flex', alignItems: 'center' }}
          >
            <div>
              현재 적용 유형:{' '}
              <span className="pill-rate" style={{ fontSize: 15 }}>
                {I.type === 'pref' ? '우대형 (납입액의 12%)' : '일반형 (납입액의 6%)'}
              </span>
              <div className="mini">일반형은 납입액의 6%, 우대형은 12%를 정부가 매월 매칭 지급합니다.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드·자동이체 매칭 */}
      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title">💳 카드·자동이체 — 은행별 우대금리 매칭용</p>
        <div className="grid cols2">
          <div className="field">
            <label>주 사용 카드사</label>
            <select value={I.cardCo} onChange={(e) => setInput('cardCo', e.target.value)}>
              <option value="">없음</option>
              {BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.cardPref != null ? ` (카드우대 +${(b.cardPref * 100).toFixed(1)}%p)` : ' (우대 미공시)'}
                </option>
              ))}
            </select>
            {cardCo && cardCo.cardPref != null ? (
              <label className="check" style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={I.cardSpend}
                  onChange={(e) => setInput('cardSpend', e.target.checked)}
                />
                <span>
                  실적 조건 충족 가능 → 카드 우대 +{(cardCo.cardPref * 100).toFixed(1)}%p
                  <span className="ck-sub">충족 조건: {cardCo.cardCond}</span>
                </span>
              </label>
            ) : (
              <div className="mini" style={{ marginTop: 8 }}>
                {cardCo
                  ? `${cardCo.name}는 카드 우대조건이 공시되지 않아 카드 우대를 반영하지 않습니다(가입 은행에서 직접 확인 필요).`
                  : '카드사를 선택하면 해당 카드의 실적 조건과 우대 폭(%p)이 표시됩니다.'}
              </div>
            )}
          </div>
          <div className="field">
            <label>적금 자동이체</label>
            <label className="check">
              <input
                type="checkbox"
                checked={I.autoTransfer}
                onChange={(e) => setInput('autoTransfer', e.target.checked)}
              />
              <span>
                월급/주거래 은행으로 자동이체 등 주거래 조건 충족 가능
                <span className="ck-sub">충족 시 그 은행의 기관 최대 우대(3%p/2%p)까지 적용</span>
              </span>
            </label>
          </div>
        </div>
        <div className="mini" style={{ marginTop: 6 }}>
          {NON_PARTICIPATING_NOTE} 카드 우대는 카드고릴라 공시 5개 은행(IBK·NH·신한·우리·하나)만 확정값입니다.
        </div>
      </div>

      {/* 전환 대상 은행 선택 */}
      <div className="card" style={{ marginTop: 16 }}>
        <p className="card-title">🎚️ 전환 대상 은행</p>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <div className="seg">
            <button
              type="button"
              className={I.bankMode === 'auto' ? 'on' : ''}
              onClick={() => setInput('bankMode', 'auto')}
            >
              자동(최적)
            </button>
            <button
              type="button"
              className={I.bankMode === 'manual' ? 'on' : ''}
              onClick={() => setInput('bankMode', 'manual')}
            >
              수동 선택
            </button>
          </div>
          {I.bankMode === 'manual' && (
            <select
              value={I.manualBank}
              onChange={(e) => setInput('manualBank', e.target.value)}
              style={{ maxWidth: 260 }}
            >
              <option value="">은행 선택…</option>
              {BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.grp === 3 ? '(최고8%)' : '(최고7%)'}
                </option>
              ))}
            </select>
          )}
          <div className="mini" style={{ flex: 1 }}>
            전환 패널·결론은 <b>{C.bank.name}</b> ({pct(C.rMirae)}) 기준으로 계산됩니다.
          </div>
        </div>
      </div>
    </>
  );
}
