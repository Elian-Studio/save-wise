// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

describe('App 스모크 (렌더 회귀 가드)', () => {
  it('던지지 않고 9개 섹션·결론·은행 14행을 렌더한다', () => {
    const { container } = render(<App />);
    // 섹션 헤딩 9개
    expect(container.querySelectorAll('h2.sec').length).toBe(11);
    // 결론 카드: 전환/유지/접전 중 하나
    expect(container.querySelector('[data-testid="verdict-main"]')?.textContent).toMatch(/전환|유지|접전/);
    // 은행 랭킹표: 기본 상위 5행 (전체 보기 토글 전)
    const bankTbl = [...container.querySelectorAll('table')].find((t) => t.querySelectorAll('thead th').length === 7);
    expect(bankTbl?.querySelectorAll('tbody tr').length).toBe(5);
  });

  it('입력 폼(number/날짜 입력 + Radix 셀렉트)이 렌더된다', () => {
    const { container } = render(<App />);
    // date/number/month 네이티브 입력
    expect(container.querySelectorAll('input').length).toBeGreaterThan(5);
    // shadcn(Radix) Select 트리거
    expect(container.querySelectorAll('[role="combobox"]').length).toBeGreaterThan(0);
  });
});
