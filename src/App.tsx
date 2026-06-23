import { useCalculator } from './hooks/useCalculator';
import { DATA_AS_OF } from './data/products';
import { InputsPanel } from './components/InputsPanel';
import { VerdictCard } from './components/VerdictCard';
import { ComparePanels } from './components/ComparePanels';
import { BankRanking } from './components/BankRanking';
import { ScenarioTables } from './components/ScenarioTables';
import { InvestmentCompare } from './components/InvestmentCompare';
import { StepsGuide } from './components/StepsGuide';
import { ProductCompare } from './components/ProductCompare';
import { Sources } from './components/Sources';
import { Disclaimer } from './components/Disclaimer';

function ddayTo(date: string): number {
  const dead = new Date(`${date}T23:59:59+09:00`).getTime();
  return Math.ceil((dead - Date.now()) / 86_400_000);
}

export default function App() {
  const api = useCalculator();
  const { inputs, result, rec } = api;
  const d = ddayTo('2026-07-03');

  return (
    <>
      <header className="top">
        <div className="wrap">
          <h1>청년도약계좌 ↔ 청년미래적금 갈아타기 계산기</h1>
          <p>
            내 상황과 거래은행을 넣으면 <b>유지/전환</b> 결론과 <b>나에게 가장 유리한 은행</b>을 찾아줍니다.
          </p>
          <div className="badges">
            <span className="badge base">기준일 {DATA_AS_OF}</span>
            <span className="badge dday">{d > 0 ? `신청 마감(7/3) D-${d}` : '청년미래적금 신청기간 종료'}</span>
            <span className="badge live">출처: 금융위·은행연합회·카드고릴라</span>
          </div>
        </div>
      </header>
      <main className="wrap">
        <InputsPanel api={api} />
        <VerdictCard C={result} rec={rec} />
        <ComparePanels I={inputs} C={result} />
        <BankRanking I={inputs} />
        <ScenarioTables I={inputs} />
        <InvestmentCompare I={inputs} C={result} />
        <StepsGuide />
        <ProductCompare />
        <Sources />
        <Disclaimer />
      </main>
    </>
  );
}
