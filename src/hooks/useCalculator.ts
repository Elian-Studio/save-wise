import { useCallback, useMemo, useState } from 'react';
import { compute, recommend, type Inputs } from '../lib/calc';
import { MAN } from '../data/products';
import { ageFromBirth, elapsedFromMonth } from '../lib/dates';

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
