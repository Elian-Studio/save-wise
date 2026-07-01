// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { YouthSavings as App } from './services/youthSavings/YouthSavings';

afterEach(cleanup);

describe('App 스모크 (위저드 렌더 회귀 가드)', () => {
  it('진입 화면: 보유/미보유 모드 선택 버튼을 던지지 않고 렌더', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('button', { name: /보유 중/ })).toBeTruthy();
    expect(getByRole('button', { name: /미보유/ })).toBeTruthy();
  });

  it('기본(갈아타기): 결과 verdict가 DOM에 존재 — 스텝 전부 마운트(프리렌더/크롤 유지)', () => {
    const { container } = render(<App />);
    // 스텝은 hidden으로 전부 마운트되므로 결과 텍스트가 초기 DOM에 존재해야 한다(SEO 핵심).
    expect(container.textContent).toMatch(/전환을 권장|유지를 권장|접전/);
    expect(container.textContent).toContain('은행 추천 TOP 3');
  });

  it('미보유(신규) 선택 → 미래적금 만기 수령액 결과 렌더', () => {
    const { getByRole, container } = render(<App />);
    fireEvent.click(getByRole('button', { name: /미보유/ }));
    expect(container.textContent).toContain('만기 예상 수령액');
  });

  it('상세 SEO 섹션(은행 순위 자세히)이 위저드 아래 렌더', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('은행별 적용금리 순위 자세히 보기');
  });
});
