// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SchemeDetail } from './SchemeDetail';

afterEach(cleanup);

// 실제 라우트 element로 감싸 :id 파라미터를 태운다. 홈(/) 프로브로 리다이렉트를 관찰한다.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/transit/cards/:id" element={<SchemeDetail />} />
        <Route path="/" element={<div>TRANSIT_HOME_PROBE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SchemeDetail 상세 페이지', () => {
  it('kpass: 이름·요약·혜택 4개·발급 스텝 3개를 렌더', () => {
    const { container } = renderAt('/transit/cards/kpass');
    const text = container.textContent ?? '';
    expect(text).toContain('K-패스');
    expect(text).toContain('자동 환급해주는 전국구 카드야');
    // 혜택 타이틀 4개
    expect(text).toContain('쓴 만큼 돌려받기');
    expect(text).toContain('전국 어디서나');
    expect(text).toContain('쓰던 카드에 얹기');
    expect(text).toContain('조건은 하나');
    // 발급 스텝 3개
    expect(text).toContain('K-패스 누리집이나 앱에서 회원가입');
    expect(text).toContain('제휴 카드사에서 K-패스 카드 발급');
    expect(text).toContain('평소처럼 찍고 타면 다음 달에 환급');
  });

  it('kpass picks: 카드형 픽은 TRANSIT_CARDS 표시명 + 신청하러 가기 링크(href/target/rel)', () => {
    const { getByText, getAllByRole } = renderAt('/transit/cards/kpass');
    // shinhan-credit → name에 발급사가 이미 있으면 issuer 접두어 생략('신한 K-패스 신한카드' 중복 방지)
    expect(getByText('K-패스 신한카드')).toBeTruthy();
    // kb-check → name('K-패스 체크')에 발급사가 없으면 issuer 접두어 유지
    expect(getByText('KB국민 K-패스 체크')).toBeTruthy();

    const applyLinks = getAllByRole('link', { name: /신청하러 가기/ }) as HTMLAnchorElement[];
    // kpass 3개 픽 모두 applyUrl 보유
    expect(applyLinks).toHaveLength(3);
    const shinhan = applyLinks[0];
    expect(shinhan.getAttribute('href')).toBe(
      'https://www.shinhancard.com/pconts/html/card/apply/credit/1225543_2207.html',
    );
    expect(shinhan.getAttribute('target')).toBe('_blank');
    expect(shinhan.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('climate: 픽이 전부 external(url 없음) → 신청하러 가기 링크 0개', () => {
    const { queryAllByRole, container } = renderAt('/transit/cards/climate');
    expect(container.textContent).toContain('기후동행카드');
    expect(queryAllByRole('link', { name: /신청하러 가기/ })).toHaveLength(0);
  });

  it('잘못된 id는 홈(/)으로 리다이렉트', () => {
    const { getByText, container } = renderAt('/transit/cards/nope');
    expect(getByText('TRANSIT_HOME_PROBE')).toBeTruthy();
    expect(container.textContent).not.toContain('발급은 이렇게');
  });

  it('하단 CTA 링크는 /?s=quiz, /?s=compare를 가리킨다', () => {
    const { getByRole } = renderAt('/transit/cards/kpass');
    expect(getByRole('link', { name: /나한테 맞는지 확인하기/ }).getAttribute('href')).toBe(
      '/?s=quiz',
    );
    expect(getByRole('link', { name: /다른 카드랑 비교/ }).getAttribute('href')).toBe(
      '/?s=compare',
    );
  });

  it('돌아가기 링크는 홈(/)', () => {
    const { getByRole } = renderAt('/transit/cards/kpass');
    expect(getByRole('link', { name: /돌아가기/ }).getAttribute('href')).toBe('/');
  });
});
