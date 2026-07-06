// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Transit } from './Transit';
import { compare, rankCards } from '../../lib/transitCardRec';

afterEach(cleanup);

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
// 결과 스텝으로 이동(다음 단계 2회).
const goResult = (getByRole: (r: string, o: { name: RegExp }) => HTMLElement) => {
  fireEvent.click(getByRole('button', { name: /다음 단계/ }));
  fireEvent.click(getByRole('button', { name: /다음 단계/ }));
};

describe('Transit 위저드', () => {
  it('hidden 전마운트: 초기 DOM에 결과 스텝(히어로·카드명)이 존재 → 프리렌더 SEO', () => {
    const { container } = render(<Transit />);
    expect(container.textContent).toContain('K-패스 월 실부담'); // 결과 히어로
    expect(container.textContent).toContain('TOP5');
    expect(container.textContent).toContain('토스뱅크'); // 카드 데이터
  });

  it('스텝 전환: 다음→다음→결과, 그리고 진행 칩으로 뒤로가기', () => {
    const { getByRole } = render(<Transit />);
    // 첫 스텝: 마지막 버튼 아님
    expect(getByRole('button', { name: /다음 단계/ })).toBeTruthy();
    goResult(getByRole);
    // 결과 스텝 도달 → 리셋 버튼 노출
    expect(getByRole('button', { name: /처음부터/ })).toBeTruthy();
    // 진행 칩(이용 조건)으로 뒤로 → 다시 다음 단계 버튼
    fireEvent.click(getByRole('button', { name: /이용 조건/ }));
    expect(getByRole('button', { name: /다음 단계/ })).toBeTruthy();
  });

  it('슬라이더 변경 → LIVE 실부담 갱신', () => {
    const { getByRole, getByLabelText, container } = render(<Transit />);
    fireEvent.click(getByRole('button', { name: /다음 단계/ })); // 카드 조건 스텝(슬라이더 노출)
    const changed = won(compare(20000, 'general', 'seoul', 'bs').kpassNet);
    const initial = won(compare(75000, 'general', 'seoul', 'bs').kpassNet);
    expect(initial).not.toBe(changed); // sanity
    fireEvent.change(getByLabelText(/월 평균 교통비/), { target: { value: '20000' } });
    expect(container.textContent).toContain(changed);
  });

  it('전월실적 0 → 실적 필요한 카드 미자격(회색) 처리', () => {
    const { getByRole, container } = render(<Transit />);
    goResult(getByRole);
    expect(container.textContent).toContain('필요'); // "전월 N만↑ 필요"
    // 미자격 타일은 opacity-70 회색 클래스
    expect(container.querySelector('article.opacity-70')).toBeTruthy();
  });

  it('결과 카드 타일은 5개 이하(TOP5)', () => {
    const { getByRole, container } = render(<Transit />);
    goResult(getByRole);
    const tiles = container.querySelectorAll('article');
    const expected = Math.min(rankCards(75000, 'check', 0).length, 5);
    expect(tiles.length).toBe(expected);
    expect(tiles.length).toBeLessThanOrEqual(5);
  });

  it('기본 카드 종류 = 체크카드(aria-pressed)', () => {
    const { getByRole } = render(<Transit />);
    fireEvent.click(getByRole('button', { name: /다음 단계/ })); // 카드 조건 스텝
    expect(getByRole('button', { name: /체크카드/ }).getAttribute('aria-pressed')).toBe('true');
    expect(getByRole('button', { name: /신용카드/ }).getAttribute('aria-pressed')).toBe('false');
  });

  it('applyUrl 있는 카드만 신청 링크 + rel="noopener" target 새 탭', () => {
    const { getByRole, container } = render(<Transit />);
    goResult(getByRole);
    const links = [...container.querySelectorAll('a')].filter((a) => /신청하러 가기/.test(a.textContent || ''));
    const expected = rankCards(75000, 'check', 0)
      .slice(0, 5)
      .filter((r) => r.card.applyUrl).length;
    expect(links.length).toBe(expected); // 데이터에 applyUrl 채워지면 자동 증가
    links.forEach((a) => {
      expect(a.getAttribute('rel')).toContain('noopener');
      expect(a.getAttribute('target')).toBe('_blank');
    });
  });

  it('비수도권(그 외 지역) 선택 시 캐비앳 노출', () => {
    const { getByRole, container } = render(<Transit />);
    expect(container.textContent).not.toContain('비수도권 기준금액'); // 기본(서울)엔 없음
    fireEvent.click(getByRole('button', { name: /그 외 지역/ })); // step0 이용 조건에 지역 세그먼트
    expect(container.textContent).toContain('비수도권 기준금액은 공식 미확정');
  });

  it('best 배너는 연회비 반영 순절감(monthlyNet) 기준임을 명시', () => {
    const { getByRole, container } = render(<Transit />);
    goResult(getByRole);
    expect(container.textContent).toContain('연회비 반영');
  });

  it('처음부터 리셋: step 0 복귀 + 입력값 보존', () => {
    const { getByRole } = render(<Transit />);
    // 카드 조건 스텝에서 신용카드로 변경 → 결과까지 진행
    fireEvent.click(getByRole('button', { name: /다음 단계/ }));
    fireEvent.click(getByRole('button', { name: /신용카드/ }));
    fireEvent.click(getByRole('button', { name: /다음 단계/ }));
    fireEvent.click(getByRole('button', { name: /처음부터/ })); // 리셋
    // step 0 복귀 → 다음 단계 버튼 재노출
    expect(getByRole('button', { name: /다음 단계/ })).toBeTruthy();
    // 입력값(카드종류=신용) 보존 확인: 카드 조건 스텝으로 이동해 신용 aria-pressed
    fireEvent.click(getByRole('button', { name: /다음 단계/ }));
    expect(getByRole('button', { name: /신용카드/ }).getAttribute('aria-pressed')).toBe('true');
  });
});
