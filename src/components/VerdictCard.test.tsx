// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { VerdictCard } from './VerdictCard';
import { compute, type Inputs, type Recommendation } from '../lib/calc';
import { MAN } from '../data/products';

afterEach(cleanup);

const I: Inputs = {
  salary: 3000,
  goal: 'amount',
  elapsed: 18,
  paidCount: 18,
  leapMonthly: 70 * MAN,
  leapRate: 0.045,
  miraeMonthly: 50 * MAN,
  type: 'pref',
  payBank: 'nh',
  mainBank: '',
  cardCo: '',
  cardSpend: false,
  autoTransfer: true,
  advisory: false,
  bankMode: 'auto',
  manualBank: '',
  investReturn: 0.07,
};
const C = compute(I);
const rec = (verdict: Recommendation['verdict']): Recommendation => ({
  verdict,
  main:
    verdict === 'switch'
      ? '청년미래적금으로 전환을 권장'
      : verdict === 'stay'
        ? '청년도약계좌 유지를 권장'
        : '접전 — 우선순위(목돈 vs 유동성)로 결정',
  reasons: ['테스트 근거'],
  factors: [],
  score: verdict === 'switch' ? 2 : verdict === 'stay' ? -2 : 0,
});

describe('VerdictCard verdict별 렌더', () => {
  it('switch → 전환 권장 + green 그라데이션', () => {
    const { container, getByTestId } = render(<VerdictCard C={C} rec={rec('switch')} />);
    expect(getByTestId('verdict-main').textContent).toContain('전환을 권장');
    expect(container.querySelector('[data-testid="verdict"]')?.className).toContain('from-fin-green');
  });
  it('stay → 유지 권장 + blue 그라데이션', () => {
    const { container, getByTestId } = render(<VerdictCard C={C} rec={rec('stay')} />);
    expect(getByTestId('verdict-main').textContent).toContain('유지를 권장');
    expect(container.querySelector('[data-testid="verdict"]')?.className).toContain('from-[#1d4ed8]');
  });
  it('close → 접전 + amber 그라데이션', () => {
    const { container, getByTestId } = render(<VerdictCard C={C} rec={rec('close')} />);
    expect(getByTestId('verdict-main').textContent).toContain('접전');
    expect(container.querySelector('[data-testid="verdict"]')?.className).toContain('from-fin-amber');
  });
});
