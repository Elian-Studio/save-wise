// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProgramDetail } from './ProgramDetail';
import { BENEFITS, type BenefitId } from '@/data/youthBenefits';

afterEach(cleanup);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/youth-benefits/programs/:id" element={<ProgramDetail />} />
        <Route path="/youth-benefits" element={<div>YOUTH_BENEFITS_HOME_PROBE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProgramDetail 상세 페이지', () => {
  const ids: BenefitId[] = ['niljeo', 'chwiup', 'jutaek', 'wolse'];

  it.each(ids)('%s: 제도명 h1과 조건 섹션·FAQ를 렌더', (id) => {
    const { getByRole, container } = renderAt(`/youth-benefits/programs/${id}`);
    const benefit = BENEFITS.find((b) => b.id === id)!;
    // h1 = 제도명
    expect(getByRole('heading', { level: 1 }).textContent).toContain(benefit.name);
    const text = container.textContent ?? '';
    expect(text).toContain('누가 받을 수 있나'); // eligibility heading
    expect(text).toContain('자주 묻는 질문'); // FAQ 섹션
    expect(text).toContain('조건이 뭐야?'); // 첫 FAQ
  });

  it('niljeo: 스펙 검증 수치(월 10만원·정부 월 30만원·1,080만원)를 렌더', () => {
    const text = renderAt('/youth-benefits/programs/niljeo').container.textContent ?? '';
    expect(text).toContain('월 10만원');
    expect(text).toContain('월 30만원');
    expect(text).toContain('1,080만원');
  });

  it('chwiup: 구직촉진수당 월 60만원·6개월·중위 120%를 렌더', () => {
    const text = renderAt('/youth-benefits/programs/chwiup').container.textContent ?? '';
    expect(text).toContain('60만원');
    expect(text).toContain('6개월');
    expect(text).toContain('120%');
  });

  it('jutaek: 연소득 5,000만원·만 19~34세·무주택을 렌더', () => {
    const text = renderAt('/youth-benefits/programs/jutaek').container.textContent ?? '';
    expect(text).toContain('5,000만원');
    expect(text).toContain('만 19~34세');
    expect(text).toContain('무주택');
  });

  it('wolse: 월 최대 20만원·최대 24개월·생애 1회를 렌더', () => {
    const text = renderAt('/youth-benefits/programs/wolse').container.textContent ?? '';
    expect(text).toContain('20만원');
    expect(text).toContain('24개월');
    expect(text).toContain('생애 1회');
  });

  it('wolse: 2026 신규 신청 마감 안내 배너를 렌더', () => {
    const text = renderAt('/youth-benefits/programs/wolse').container.textContent ?? '';
    expect(text).toContain('2026년 신규 신청');
    expect(text).toContain('마감');
    expect(text).toContain('마이홈포털');
  });

  it('niljeo: 2026 모집 마감 안내 배너를 렌더', () => {
    const text = renderAt('/youth-benefits/programs/niljeo').container.textContent ?? '';
    expect(text).toContain('마감');
    expect(text).toContain('차기 모집');
  });

  it('chwiup: 마감 배너가 없다(상시 신청)', () => {
    const { queryByText } = renderAt('/youth-benefits/programs/chwiup');
    expect(queryByText(/신청 안내/)).toBeNull();
  });

  it('공식 신청 CTA는 BENEFITS의 apply url을 새 탭으로 가리킨다', () => {
    const { getByRole } = renderAt('/youth-benefits/programs/niljeo');
    const link = getByRole('link', { name: /공식 신청/ }) as HTMLAnchorElement;
    const url = BENEFITS.find((b) => b.id === 'niljeo')!.cta;
    expect(url.kind).toBe('apply');
    expect(link.getAttribute('href')).toBe(url.kind === 'apply' ? url.url : '');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it("자격 진단 CTA는 '/youth-benefits'를 가리킨다", () => {
    const { getByRole } = renderAt('/youth-benefits/programs/jutaek');
    expect(getByRole('link', { name: /30초 진단/ }).getAttribute('href')).toBe('/youth-benefits');
  });

  it('잘못된 id는 /youth-benefits로 리다이렉트', () => {
    const { getByText, container } = renderAt('/youth-benefits/programs/nope');
    expect(getByText('YOUTH_BENEFITS_HOME_PROBE')).toBeTruthy();
    expect(container.textContent).not.toContain('누가 받을 수 있나');
  });
});
