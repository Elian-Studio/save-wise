// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import App from '../App';

afterEach(cleanup);

describe('폼 라벨 연결 (P1 접근성)', () => {
  it('주요 number/date 입력이 라벨로 접근 가능', () => {
    const { getByLabelText } = render(<App />);
    expect(getByLabelText(/연 총급여/)).toBeTruthy();
    expect(getByLabelText(/생년월일/)).toBeTruthy();
    expect(getByLabelText(/현재 적용 금리/)).toBeTruthy();
    expect(getByLabelText(/월 납입액/)).toBeTruthy();
  });
  it('Select 트리거(combobox)에 id가 부여돼 라벨과 연결 가능', () => {
    const { container } = render(<App />);
    const comboboxes = [...container.querySelectorAll('[role="combobox"]')];
    expect(comboboxes.length).toBeGreaterThan(0);
    // Field로 감싼 Select는 id를 가져 Label htmlFor와 연결됨
    expect(comboboxes.some((c) => c.id)).toBe(true);
  });
});

describe('InputsPanel 입력 반영', () => {
  it('연 총급여 변경 → 소득구간 문구 갱신', () => {
    const { getByLabelText, container } = render(<App />);
    const salary = getByLabelText(/연 총급여/);
    fireEvent.change(salary, { target: { value: '6500' } });
    expect(container.textContent).toContain('6,000~7,500만원');
  });
});

describe('BankRanking 전체보기 토글', () => {
  const bankTable = (root: HTMLElement) =>
    [...root.querySelectorAll('table')].find((t) => /순위/.test(t.querySelector('thead')?.textContent || ''))!;
  it('기본 상위 5행 → 토글 시 14행', () => {
    const { container, getByRole } = render(<App />);
    expect(bankTable(container).querySelectorAll('tbody tr').length).toBe(5);
    fireEvent.click(getByRole('button', { name: /전체 \d+개 은행 보기/ }));
    expect(bankTable(container).querySelectorAll('tbody tr').length).toBe(14);
  });
});

describe('a11y 구조', () => {
  it('모든 테이블 헤더 셀에 scope="col"', () => {
    const { container } = render(<App />);
    const ths = [...container.querySelectorAll('thead th')];
    expect(ths.length).toBeGreaterThan(0);
    expect(ths.every((th) => th.getAttribute('scope') === 'col')).toBe(true);
  });
  it('GradeDot이 색 외 기호(✓)와 스크린리더 텍스트(sr-only)를 제공', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓');
    const srOnly = [...container.querySelectorAll('.sr-only')].map((e) => e.textContent || '');
    expect(srOnly.some((t) => t.includes('데이터'))).toBe(true);
  });
});
