// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

const clickTab = (getByRole: (role: string, opts: { name: RegExp }) => HTMLElement, name: RegExp) =>
  fireEvent.click(getByRole('button', { name }));
const toSwitch = (getByRole: (role: string, opts: { name: RegExp }) => HTMLElement) => clickTab(getByRole, /갈아타기/);
const toNew = (getByRole: (role: string, opts: { name: RegExp }) => HTMLElement) => clickTab(getByRole, /신규 가입/);

describe('App 스모크 (렌더 회귀 가드)', () => {
  // 기본 모드는 'switch'(갈아타기) — 도메인·SEO 정체성과 일치. 신규 모드는 토글로 진입.
  it('신규 모드: 예상 결과 카드 + 은행 14행을 던지지 않고 렌더', () => {
    const { container, getByRole } = render(<App />);
    toNew(getByRole);
    // 신규 모드 결과 카드(유지/전환 verdict 없음)
    expect(container.querySelector('[data-testid="mirae-summary"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="verdict-main"]')).toBeNull();
    // 은행 랭킹표: 기본 상위 5행
    const bankTbl = [...container.querySelectorAll('table')].find((t) => t.querySelectorAll('thead th').length === 7);
    expect(bankTbl?.querySelectorAll('tbody tr').length).toBe(5);
  });

  it('갈아타기 모드 → 결론(verdict) 카드와 추가 섹션이 신규보다 많이 렌더', () => {
    const { container, getByRole } = render(<App />);
    toNew(getByRole);
    const newSecs = container.querySelectorAll('h2.sec').length;
    toSwitch(getByRole);
    expect(container.querySelector('[data-testid="verdict-main"]')?.textContent).toMatch(/전환|유지|접전/);
    // 갈아타기 모드는 비교/요인/단계 섹션이 더 많다
    expect(container.querySelectorAll('h2.sec').length).toBeGreaterThan(newSecs);
  });

  it('입력 폼(number/날짜 입력 + Radix 셀렉트)이 렌더되고, 갈아타기 시 도약 입력이 추가된다', () => {
    const { container, getByRole } = render(<App />);
    toNew(getByRole);
    expect(container.querySelectorAll('[role="combobox"]').length).toBeGreaterThan(0);
    const newInputs = container.querySelectorAll('input').length;
    expect(newInputs).toBeGreaterThan(0);
    toSwitch(getByRole);
    expect(container.querySelectorAll('input').length).toBeGreaterThan(newInputs);
  });
});
