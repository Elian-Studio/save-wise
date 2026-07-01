// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { YouthSavings as App } from '../services/youthSavings/YouthSavings';

afterEach(cleanup);

describe('위저드 입력 접근성·반영', () => {
  it('출생 연도 슬라이더가 라벨로 접근 가능하고 만 나이에 반영', () => {
    const { getByLabelText, container } = render(<App />);
    const slider = getByLabelText(/출생 연도/);
    expect(slider).toBeTruthy();
    fireEvent.change(slider, { target: { value: '2005' } });
    expect(container.textContent).toMatch(/만 \d+세/);
  });

  it('주거래·급여이체 은행 select가 라벨로 접근 가능', () => {
    const { getAllByLabelText } = render(<App />);
    expect(getAllByLabelText(/주거래 은행/).length).toBeGreaterThan(0);
    expect(getAllByLabelText(/급여이체 은행/).length).toBeGreaterThan(0);
  });

  it('소득 구간 세그먼트 클릭이 던지지 않고 최적 은행 패널 유지', () => {
    const { getByRole, container } = render(<App />);
    fireEvent.click(getByRole('button', { name: /보유 중/ })); // 진입 → 기본정보 스텝(세그먼트 노출)
    fireEvent.click(getByRole('button', { name: /6,000만원 초과/ }));
    expect(container.textContent).toContain('최적 은행');
  });
});

describe('상세 BankRanking 전체보기 토글 (위저드 아래 SEO 섹션)', () => {
  const bankTable = (root: HTMLElement) =>
    [...root.querySelectorAll('table')].find((t) => /순위/.test(t.querySelector('thead')?.textContent || ''))!;
  it('기본 상위 5행 → 토글 시 14행', () => {
    const { container, getByRole } = render(<App />);
    expect(bankTable(container).querySelectorAll('tbody tr').length).toBe(5);
    fireEvent.click(getByRole('button', { name: /전체 \d+개 은행 보기/ }));
    expect(bankTable(container).querySelectorAll('tbody tr').length).toBe(14);
  });
});

describe('a11y 구조 (SEO 상세 섹션)', () => {
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
