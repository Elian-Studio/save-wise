import { useCallback, useEffect, useMemo, useState } from 'react';
import { compute, recommend, type Inputs } from '../lib/calc';
import { MAN } from '../data/products';
import { ageFromBirth, elapsedFromMonth } from '../lib/dates';
import { readShareFromUrl } from '../lib/share';

const DEFAULTS: Inputs = {
  scenario: 'switch', // 기본: 갈아타기 — 도메인·SEO 정체성(choicewise.kr 갈아타기 계산기)과 일치. 신규는 토글로 진입.
  salary: 3000,
  goal: 'amount',
  elapsed: 18,
  paidCount: 18,
  leapMonthly: 70 * MAN,
  leapRate: 0.045,
  miraeMonthly: 50 * MAN,
  type: 'pref',
  payBank: '',
  mainBank: '',
  cardCo: 'nh',
  cardSpend: true,
  autoTransfer: true,
  advisory: false,
  bankMode: 'auto',
  manualBank: '',
  investReturn: 0.07,
};

export function useCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [birth, setBirth] = useState('1997-05-10');
  const [leapStart, setLeapStartState] = useState('2024-12');

  // 공유 링크(?s=) 복원 — 마운트 후 적용. 초기 렌더는 DEFAULTS라 프리렌더 마크업과 일치(hydration mismatch 회피).
  // App의 D-day와 동일하게 '마운트 1회 클라 전용 상태 주입'이라 set-state-in-effect 의도적 허용.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const shared = readShareFromUrl(window.location.search);
    if (!shared) return;
    if (shared.inputs) setInputs((prev) => ({ ...prev, ...shared.inputs })); // DEFAULTS 위에 머지 → 스키마 변경에 안전
    if (shared.leapStart) setLeapStartState(shared.leapStart); // birth는 공유에 미포함(PII) → 수신자는 기본값 표시
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setInput = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setLeapStart = useCallback((v: string) => {
    setLeapStartState(v);
    setInputs((prev) => ({ ...prev, elapsed: elapsedFromMonth(v) }));
  }, []);

  const age = useMemo(() => ageFromBirth(birth), [birth]);
  const result = useMemo(() => compute(inputs), [inputs]);
  const rec = useMemo(() => recommend(inputs, result), [inputs, result]);

  return { inputs, setInput, birth, setBirth, leapStart, setLeapStart, age, result, rec };
}

export type CalculatorApi = ReturnType<typeof useCalculator>;
