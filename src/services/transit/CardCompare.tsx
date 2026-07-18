import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { TRANSIT_CARDS, DATA_AS_OF, type CardType, type TransitCard } from '../../data/transitCards';
import { kpassRefund } from '../../lib/transitSchemeRec';
import { cardBenefit, benefitSummary } from '../../lib/cardCompare';
import { cardCompareFaq } from './seo';
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

// 카드별 한줄 코멘트 — transitCards.ts의 minPrevSpend·annualFee·benefit·tiers에서만 파생(혜택 발명 금지).
const cardComment = (c: TransitCard): string => {
  const prev = c.minPrevSpend === 0 ? '전월실적 조건 없음' : `전월 ${c.minPrevSpend / 10000}만 실적`;
  const fee = c.annualFee === 0 ? '연회비 무료' : `연회비 ${won(c.annualFee)}`;
  const tier = c.tiers && c.tiers.length > 0 ? ' · 실적 높이면 한도 상향' : '';
  return `${prev} · ${fee}${tier} — ${benefitSummary(c)}`;
};

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

        {/* 선택 가이드 산문 — 얇은 비교 페이지를 실사용 판단이 가능한 페이지로 보강 */}
        <section className="mt-11">
          <h2 className="mb-3.5 text-[19px] font-extrabold text-ink">{label}카드, 이렇게 고르세요</h2>

          <div className="rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">전월실적의 함정</div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              K-패스 카드의 추가혜택은 대부분 <b>전월실적 조건</b>이 붙습니다. 위 표는 전월실적{' '}
              {prevLabel(PREV_SPEND)}을 채웠다고 가정해 계산한 값이에요.{' '}
              {cardType === 'check'
                ? '체크카드는 실적 문턱이 낮은 편이라 전월 30만원이면 대부분 기본 혜택이 나오고, 토스뱅크 K-패스 체크처럼 실적 조건이 없는 카드도 있어요. 다만 함정이 하나 있습니다 — 교통비 자체는 전월실적에 안 잡히는 카드가 많아, 30만원은 교통비가 아닌 다른 지출로 따로 채워야 합니다(NH농협 체크처럼 교통비도 실적에 포함되는 카드는 예외예요).'
                : '신용카드는 실적 문턱이 30만~50만원으로 체크보다 높습니다. 대신 실적을 더 쌓으면 월 한도가 올라가는 카드가 많아 교통비 지출이 큰 사람에게 유리해요. 여기서도 교통비가 전월실적에 포함되는지는 카드마다 다르니(신한 K-패스는 교통비도 실적 포함), 실적 30만~50만원은 다른 지출로 채워야 하는 경우가 많습니다.'}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">
              {cardType === 'check' ? '체크가 유리할 때, 신용이 나을 때' : '신용이 유리할 때, 체크가 나을 때'}
            </div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              {cardType === 'check'
                ? '체크카드는 연회비가 없고(비교 대상 전부 무료) 실적 문턱이 낮아, 교통비가 많지 않거나 전월실적을 채우기 부담스러운 사람에게 무난합니다. 대신 월 추가혜택 한도가 2천~4천원대로 작아요. 교통비를 많이 쓰고 다른 지출로 실적을 쉽게 채운다면, 월 한도가 훨씬 큰 신용카드가 더 많이 돌려줍니다.'
                : '신용카드는 연회비(2천~2만원)를 내는 대신 월 캐시백 한도가 커(신한 60만↑ 월 1.5만원, 티머니 Pay&GO 100만↑ 월 1.8만원 등) 교통비 지출이 큰 사람이 더 많이 돌려받습니다. 반대로 교통비가 적거나 전월실적 채우기가 부담스러우면, 무연회비에 실적 문턱이 낮은 체크카드가 실익이 더 클 수 있어요.'}{' '}
              <Link
                to={`/transit/cards/compare/${otherType}`}
                className="font-extrabold underline underline-offset-2"
                style={{ color: HERO.colorDark }}
              >
                {otherLabel}카드 비교
              </Link>
              도 함께 보고 결정하세요.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-card p-5.5">
            <div className="text-base font-extrabold text-ink">정부 환급은 카드와 무관, 추가혜택만 다르다</div>
            <p className="mt-2 text-[14.5px] font-medium leading-[1.7] text-foreground/90">
              다시 강조하면, 정부 환급은 어떤 K-패스 카드로 타든 동일합니다. 카드 선택으로 달라지는 건 그 위에 얹히는
              카드사 추가혜택뿐이에요. 그래서 ‘어느 카드가 정부 환급을 더 주나’가 아니라 ‘내 교통비·실적에서 카드사
              추가혜택이 가장 큰 카드가 무엇이냐’로 골라야 합니다.
            </p>
          </div>

          {/* 카드별 한줄 코멘트 — 상위 카드, 데이터 파생 */}
          <div className="mt-4">
            <div className="mb-2.5 text-[15px] font-extrabold text-ink">상위 {label}카드 한줄평</div>
            <ul className="flex flex-col gap-2.5">
              {cards.slice(0, 5).map((c) => (
                <li key={c.id} className="rounded-2xl border border-line bg-card p-4.5">
                  <div className="text-[14.5px] font-extrabold text-ink">{displayName(c)}</div>
                  <div className="mt-1 text-[13.5px] font-medium leading-[1.55] text-muted-foreground">
                    {cardComment(c)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ — 화면 텍스트와 cardCompareSeos의 FAQPage JSON-LD가 1:1 일치(type별) */}
        <section className="mt-10">
          <h2 className="mb-3.5 text-[19px] font-extrabold text-ink">자주 묻는 질문</h2>
          <div className="flex flex-col gap-3">
            {cardCompareFaq(cardType).map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-card p-5">
                <div className="text-[15px] font-extrabold text-ink">Q. {f.q}</div>
                <div className="mt-1.5 text-[14.5px] font-medium leading-[1.6] text-muted-foreground">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

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
