import { Link } from 'react-router-dom';
import { DATA_AS_OF } from '../../data/transitCards';

// 서비스 소개(/about). 애드센스 신뢰 판단용 정보 페이지 — 전역 토큰(text-ink 계열) 사용.
export function About() {
  return (
    <article className="mx-auto max-w-[720px] px-[18px] py-10 leading-[1.75] text-foreground">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">서비스 소개</h1>

      <p className="mt-5">
        choicewise는 정부 지원 제도를 내 상황에 맞게 비교해 주는 무료 계산·비교 도구입니다. 교통카드 추천(패스픽)과
        청년 금융상품 계산기를 제공하며, 회원가입이나 개인정보 수집 없이 브라우저 안에서만 계산이 이루어집니다.
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">무엇을 하는 서비스인가요</h2>
      <p className="mt-3">
        패스픽은 기후동행카드·K-패스·The 경기패스·인천 I-패스·후불 교통카드 등 여러 제도를 30초 퀴즈로 비교해,
        거주지·나이·이용 패턴에 맞는 교통카드를 추천합니다. 청년적금 계산기는 청년도약계좌 유지와 청년미래적금
        갈아타기(또는 신규 가입)를 내 소득·거래은행 기준으로 비교하고 가장 유리한 은행까지 찾아줍니다. 모든 기능은
        무료이며 광고 외에는 별도 비용이 없습니다.
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">왜 만들었나요</h2>
      <p className="mt-3">
        K-패스, 기후동행카드, 청년 적금 같은 정부 지원 제도는 조건이 복잡해서 어떤 선택지가 나에게 맞는지 알기
        어렵습니다. 은행이나 카드사의 광고 최고 조건이 아니라 실제로 받을 수 있는 혜택을 기준으로, 흩어져 있는 공식
        자료를 검증해 한 곳에서 비교할 수 있게 만들었습니다.
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">데이터 출처 정책</h2>
      <p className="mt-3">
        모든 수치는 정부 공식 발표와 각 금융사·카드사의 공식 상품 페이지를 기준으로 합니다. 교통 제도는 국토교통부
        대도시권광역교통위원회, 정책브리핑(korea.kr), 서울시·경기도·인천시 공지를, 금융상품은 전국은행연합회 소비자포털,
        금융위원회 보도자료, 서민금융진흥원 안내를 근거로 합니다. 아직 공식적으로 확인되지 않았거나 추정에 해당하는
        값은 화면에서 그렇게 표기합니다.
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">갱신 정책</h2>
      <p className="mt-3">
        제도가 개편되면 데이터를 갱신하며, 화면과 자료에는 데이터 기준일({DATA_AS_OF})을 표기합니다. 이용하는 시점에는
        제도가 달라졌을 수 있으니, 최종 가입·신청 전에는 반드시 해당 기관의 공식 채널에서 다시 확인해 주세요.
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">한계 고지</h2>
      <p className="mt-3">
        본 계산기들은 공개 자료 기반 참고용 추정입니다. 최종 결정 전 반드시 해당 기관에 확인하세요. 본 서비스는
        투자·금융 자문이 아닙니다.
      </p>

      <p className="mt-9 text-sm text-muted-foreground">
        데이터 오류 제보나 제휴 문의는{' '}
        <Link className="underline hover:text-foreground" to="/contact">
          문의 페이지
        </Link>
        를 이용해 주세요.
      </p>
    </article>
  );
}
