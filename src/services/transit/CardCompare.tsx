import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { TRANSIT_CARDS, DATA_AS_OF, type CardType, type TransitCard } from '../../data/transitCards';
import { kpassRefund } from '../../lib/transitSchemeRec';
import { cardBenefit, benefitSummary } from '../../lib/cardCompare';
import { Button } from '@/components/ui/button';

// 고정 비교 시나리오 — 카피에 명시. 이 값으로 모든 카드의 월 추가혜택을 동일 조건에서 계산한다.
const SPEND = 70000; // 월 대중교통비
const PREV_SPEND = 500000; // 전월 카드실적
const HERO = { color: '#3B5BDB', colorDark: '#2B44A8' }; // K-패스 상세와 동일 톤

const won = (n: number): string => n.toLocaleString('ko-KR') + '원';
const prevLabel = (n: number): string => (n === 0 ? '무실적' : `${n / 10000}만원`);
const feeLabel = (n: number): string => (n === 0 ? '무료' : won(n));
const displayName = (c: TransitCard): string =>
  c.name.includes(c.issuer) ? c.name : `${c.issuer} ${c.name}`;

export function CardCompare() {
  const { type } = useParams<{ type: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (type !== 'check' && type !== 'credit') return <Navigate to="/transit/cards/kpass" replace />;
  const cardType = type as CardType;
  const label = cardType === 'check' ? '체크' : '신용';

  const cards = TRANSIT_CARDS.filter((c) => c.type === cardType && !c.discontinued).sort(
    (a, b) => cardBenefit(b, SPEND, PREV_SPEND) - cardBenefit(a, SPEND, PREV_SPEND),
  );
  const tiered = cards.filter((c) => c.tiers && c.tiers.length > 0);
  const gone = TRANSIT_CARDS.filter((c) => c.type === cardType && c.discontinued);
  const hasPress = cards.some((c) => c.grade === 'press');
  const otherType = cardType === 'check' ? 'credit' : 'check';
  const otherLabel = cardType === 'check' ? '신용' : '체크';

  const govRefund = kpassRefund(SPEND, 'general', false).refund;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 히어로 */}
      <section
        className="px-[18px] pt-12 pb-11 text-white"
        style={{ background: `linear-gradient(160deg, ${HERO.color}, ${HERO.colorDark})` }}
      >
        <div className="mx-auto max-w-[1080px]">
          <nav className="mb-6 text-[13px] font-semibold opacity-85" aria-label="breadcrumb">
            <Link to="/" className="hover:underline">
              홈
            </Link>
            <span className="px-1.5">›</span>
            <Link to="/transit/cards/kpass" className="hover:underline">
              K-패스
            </Link>
            <span className="px-1.5">›</span>
            <span>{label}카드 비교</span>
          </nav>
          <h1 className="text-[clamp(30px,5vw,48px)] font-extrabold tracking-[-0.04em]">
            K-패스 {label}카드 비교 (2026)
          </h1>
          <p className="mt-3.5 max-w-[560px] text-[16.5px] font-medium leading-[1.55] opacity-90">
            정부 환급은 모든 K-패스 카드가 똑같아요. 차이는 <b>카드사가 얹어주는 추가혜택</b>이에요.
            월 대중교통 {won(SPEND)}·전월실적 {prevLabel(PREV_SPEND)} 기준으로 {label}카드 {cards.length}종을
            줄 세웠어요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1080px] px-[18px] pt-9">
        {/* 맥락 카드 — 정부환급(카드 공통) 1회 표기 */}
        <div className="rounded-2xl border border-line bg-card p-5.5">
          <div className="text-base font-extrabold text-ink">먼저, 모든 카드 공통인 정부 환급</div>
          <div className="mt-2 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">
            월 {won(SPEND)}을 쓰는 일반 연령이라면 K-패스 정부 환급은 <b>약 {won(govRefund)}</b>이에요. 이
            환급은 어떤 K-패스 카드를 쓰든 동일해요. 아래 표는 <b>그 위에 얹히는 카드사 추가혜택</b>만 비교한
            거예요.
          </div>
          <div className="mt-2 text-[13px] font-medium leading-[1.5] text-muted-foreground">
            ※ 청년(30%)·저소득(53.3%)은 환급률이 더 높아 정부 환급액이 커져요. 위 값은 일반 연령 기준이에요.
          </div>
        </div>

        {/* 비교 표 */}
        <div className="mt-9 mb-3.5 text-[17px] font-extrabold text-ink">
          {label}카드 추가혜택 순위
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[13px] font-bold text-muted-foreground">
                <th className="px-4 py-3.5">순위</th>
                <th className="px-4 py-3.5">카드</th>
                <th className="px-4 py-3.5">대중교통 혜택</th>
                <th className="px-4 py-3.5">전월실적</th>
                <th className="px-4 py-3.5">연회비</th>
                <th className="px-4 py-3.5 text-right">월 추가혜택</th>
                <th className="px-4 py-3.5">신청</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c, i) => (
                <tr key={c.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-4 text-[15px] font-extrabold text-ink">{i + 1}</td>
                  <td className="px-4 py-4">
                    <span className="text-[14.5px] font-extrabold text-ink">{displayName(c)}</span>
                    {c.grade === 'press' && (
                      <span className="ml-1.5" title="공시 미확정 항목 있음(추정)">
                        🟡
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[13.5px] font-medium text-muted-foreground">
                    {benefitSummary(c)}
                  </td>
                  <td className="px-4 py-4 text-[13.5px] font-medium text-foreground/90">
                    {prevLabel(c.minPrevSpend)}
                  </td>
                  <td className="px-4 py-4 text-[13.5px] font-medium text-foreground/90">
                    {feeLabel(c.annualFee)}
                  </td>
                  <td
                    className="px-4 py-4 text-right text-[15px] font-extrabold"
                    style={{ color: HERO.colorDark }}
                  >
                    {won(cardBenefit(c, SPEND, PREV_SPEND))}
                  </td>
                  <td className="px-4 py-4">
                    {c.applyUrl ? (
                      <a
                        href={c.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] font-extrabold underline underline-offset-2"
                        style={{ color: HERO.colorDark }}
                      >
                        신청 →
                      </a>
                    ) : (
                      <span className="text-[13.5px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasPress && (
          <div className="mt-3 text-[13px] font-medium leading-[1.5] text-muted-foreground">
            🟡 = 카드사 공시에 미확정 항목이 있어 일부 수치는 추정이에요. 신청 전 카드사 페이지에서 재확인하세요.
          </div>
        )}
        <div className="mt-2 text-[13px] font-medium leading-[1.5] text-muted-foreground">
          ※ 전월실적 {prevLabel(PREV_SPEND)} 기준이라 각 카드 기본 구간이 적용돼요. 60만원 이상 상위 실적
          구간은 각 카드 상세를 참고하세요.
        </div>

        {/* 상위 실적 구간 안내 */}
        {tiered.length > 0 && (
          <div className="mt-9">
            <div className="mb-3.5 text-[17px] font-extrabold text-ink">실적 높이면 한도 상향</div>
            <div className="flex flex-col gap-2.5">
              {tiered.map((c) => (
                <div key={c.id} className="rounded-2xl border border-line bg-card p-5">
                  <div className="text-[15px] font-extrabold text-ink">{displayName(c)}</div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {c.tiers!.map((t) => (
                      <li
                        key={t.minPrevSpend}
                        className="text-[14px] font-medium leading-[1.5] text-muted-foreground"
                      >
                        전월 {prevLabel(t.minPrevSpend)}↑ →{' '}
                        {t.benefit.kind === 'pct'
                          ? `대중교통 ${Math.round(t.benefit.pct * 100)}% · 월 ${
                              t.benefit.monthlyCap == null
                                ? '한도 없음'
                                : won(t.benefit.monthlyCap) + ' 한도'
                            }`
                          : `${won(t.benefit.amount)}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 발급 중단 안내 */}
        {gone.length > 0 && (
          <div className="mt-9 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <div className="text-[15px] font-extrabold">신규 발급 중단</div>
            <div className="mt-1.5 text-[14px] font-medium leading-[1.6]">
              {gone.map((c) => displayName(c)).join(', ')}는 신규 발급이 중단돼 비교에서 제외했어요.
            </div>
          </div>
        )}

        {/* 출처·주의 */}
        <div className="mt-9 text-[13px] font-medium leading-[1.6] text-muted-foreground">
          데이터 기준 {DATA_AS_OF} · 카드사 공시 기준. 혜택 조건·월 한도는 수시로 바뀌므로 신청 전 각 카드사
          페이지에서 반드시 재확인하세요.
        </div>

        {/* 교차 링크 */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Button asChild variant="navy" className="h-auto py-4 text-base font-extrabold">
            <Link to={`/transit/cards/compare/${otherType}`}>K-패스 {otherLabel}카드 비교</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 text-base font-bold text-ink">
            <Link to="/transit/cards/kpass">K-패스 제도 상세</Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 text-base font-bold text-ink">
            <Link to="/?s=quiz">내 교통카드 진단</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
