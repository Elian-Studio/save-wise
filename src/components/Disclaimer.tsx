import type { Scenario } from '../lib/calc';

// 서비스별 계산 가정 고지(youth-savings). 앱 전역 면책·개인정보·문의는 Shell 푸터가 담당.
export function Disclaimer({ scenario }: { scenario: Scenario }) {
  const isNew = scenario === 'new';
  return (
    <div className="mt-4 rounded-[10px] border bg-card px-4 py-3.5 text-xs text-muted-foreground">
      ※ 계산 가정: 이자는 <b>단리 적금식·비과세</b>, 정부기여금에도 동일 이자 적용. ‘연 실질효과율’은
      (정부기여금+이자)를 단리 적금 수익률로 환산한 값으로 마케팅상 ‘최대 19.4%’ 산정 방식과 다를 수 있습니다. 은행
      우대금리는{' '}
      {isNew
        ? '첫거래(예적금 미보유) 자동충족·출시 우대에 급여이체·카드 우대와 공통우대(소득 0.5%p·재무상담 0.2%p)'
        : '갈아타기 자동충족(도약 연계가입·예적금 미보유)·출시 우대에 급여이체·카드 우대와 공통우대(소득 0.5%p·재무상담 0.2%p)'}
      를 합산하되 <b>기관 상한(3%p/2%p)으로 캡</b>합니다(최고 8%/7%). 항목별 %p·충족조건은{' '}
      <b>은행연합회 소비자포털 비교공시 정본(2026-06)</b> 기준이며, 일부 항목(횟수·금액)은 은행별로 달라 가입 전
      재확인이 필요합니다.
    </div>
  );
}
