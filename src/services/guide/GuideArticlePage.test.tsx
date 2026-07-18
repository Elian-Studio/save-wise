// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GuideArticlePage } from './GuideArticlePage';

afterEach(cleanup);

// 실제 라우트 element로 :slug를 태운다. /guide 프로브로 리다이렉트를 관찰한다.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/guide/:slug" element={<GuideArticlePage />} />
        <Route path="/guide" element={<div>GUIDE_LIST_PROBE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

const ART = '/guide/cheongdogye-vs-cheongmijeok';

describe('GuideArticlePage 아티클 상세', () => {
  it('잘못된 slug는 /guide로 리다이렉트', () => {
    const { getByText, container } = renderAt('/guide/nope-nonexistent');
    expect(getByText('GUIDE_LIST_PROBE')).toBeTruthy();
    expect(container.textContent).not.toContain('choicewise 편집팀');
  });

  it('내부 인라인 링크는 <a href="/..."> (target 없음)', () => {
    const { getByRole } = renderAt(ART);
    const link = getByRole('link', { name: 'choicewise 갈아타기 계산기' }) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/youth-savings');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('외부 인라인 링크는 target=_blank rel=noopener noreferrer', () => {
    const { getByRole } = renderAt(ART);
    const link = getByRole('link', {
      name: '서민금융진흥원 청년미래적금 안내',
    }) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(
      'https://www.kinfa.or.kr/financialProduct/youthFutureSavings.do',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('섹션 CTA가 라벨을 가진 내부 링크로 렌더', () => {
    const { getByRole } = renderAt(ART);
    const cta = getByRole('link', { name: /내 조건 넣고 3분 만에 비교하기/ }) as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/youth-savings');
  });

  it('표 행(라벨·값)이 렌더된다', () => {
    const { container } = renderAt(ART);
    const text = container.textContent ?? '';
    expect(text).toContain('월 납입 한도');
    expect(text).toContain('한눈에');
  });

  it('바이라인 "choicewise 편집팀" + /about 링크', () => {
    const { getByRole, container } = renderAt(ART);
    expect(container.textContent).toContain('choicewise 편집팀');
    expect(
      (getByRole('link', { name: /데이터 출처·검증 정책/ }) as HTMLAnchorElement).getAttribute(
        'href',
      ),
    ).toBe('/about');
  });

  // ponytail: sourceStatus 'needs-review' 안내문 분기는 현재 두 아티클이 모두 'verified'라 미노출 —
  // 모킹으로 억지 렌더하지 않고 스킵. needs-review 아티클이 실제로 추가되면 그때 커버.
});
