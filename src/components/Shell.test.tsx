// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './Shell';
import { ROUTE_SEO } from '../seo/routes';

let mqCb: ((e: { matches: boolean }) => void) | null = null;

beforeEach(() => {
  mqCb = null;
  // jsdom엔 matchMedia가 없음 — Shell의 시스템 테마 리스너용 목.
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      mqCb = cb;
    },
    removeEventListener: () => {
      mqCb = null;
    },
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
    onchange: null,
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<div>home</div>} />
          <Route path="/youth-savings" element={<div>youth-savings</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Shell', () => {
  it('라우트 전환 시 document.title 동기화', () => {
    renderAt('/youth-savings');
    expect(document.title).toBe(ROUTE_SEO.find((s) => s.path === '/youth-savings')!.title);
  });

  it('저장된 theme가 있으면 시스템 변경을 무시(게이트)', () => {
    localStorage.setItem('theme', 'light');
    renderAt('/');
    mqCb?.({ matches: true });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('저장값 없으면 시스템 변경을 추종', () => {
    renderAt('/');
    mqCb?.({ matches: true });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('토글 클릭: .dark 클래스 + localStorage 저장', () => {
    const { getByLabelText } = renderAt('/');
    fireEvent.click(getByLabelText('라이트/다크 테마 전환'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
