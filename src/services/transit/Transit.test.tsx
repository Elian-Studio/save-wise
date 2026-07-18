// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Transit } from './Transit';
import { recommend } from '../../lib/transitSchemeRec';

afterEach(cleanup);

const at = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Transit />
    </MemoryRouter>,
  );

// 시나리오: 서울 → 19~34세 → 60번 넘게 → 지하철·시내버스 (4문항, 승자는 엔진이 결정)
const answerAllQuestions = (getByRole: (r: string, o: { name: RegExp }) => HTMLElement) => {
  fireEvent.click(getByRole('button', { name: /30초 만에 내 카드 찾기/ }));
  fireEvent.click(getByRole('button', { name: /^서울$/ }));
  fireEvent.click(getByRole('button', { name: /19~34세/ }));
  fireEvent.click(getByRole('button', { name: /60번 넘게/ }));
  fireEvent.click(getByRole('button', { name: /지하철·시내버스/ }));
};

describe('패스와이즈 Transit', () => {
  it('SSG: 초기 DOM에 홈 히어로·5개 제도명·비교표 텍스트가 모두 존재(hidden 전마운트)', () => {
    const { container } = at();
    const t = container.textContent ?? '';
    expect(t).toContain('매달 나가는 교통비');
    for (const name of ['기후동행카드', 'K-패스', 'The 경기패스', '인천 I-패스', '후불 교통카드']) {
      expect(t).toContain(name);
    }
    expect(t).toContain('서울 전용'); // climate compareRows
    expect(t).toContain('경기도민 전용'); // gyeonggi compareRows
  });

  it('SSG: 초기 DOM에 홈 가이드 헤딩·HOME_FAQ 첫 질문이 존재', () => {
    const { container } = at();
    const t = container.textContent ?? '';
    expect(t).toContain('2026 교통카드 5종, 한눈에');
    expect(t).toContain('어떤 카드를 골라야 하나');
    expect(t).toContain('기후동행카드 아직 만들 수 있어?'); // HOME_FAQ 첫 질문(충전 종료 반영)
  });

  it('퀴즈 플로우: 4문항 답하면 승자 상세 CTA·근거·후보가 렌더된다', () => {
    const { getByRole, getByText } = at();
    answerAllQuestions(getByRole);
    const rec = recommend({ region: 'seoul', age: 'y', trips: 'lots', mode: 'metro' });
    // 결과 화면 노출 + 승자 상세 CTA가 엔진이 고른 승자 id를 가리킴(이중 환급 반영 → K-패스)
    expect(getByRole('link', { name: /이 카드 자세히 보기/ }).getAttribute('href')).toBe(
      `/transit/cards/${rec.list[0].id}`,
    );
    expect(getByText(rec.list[0].reasons[0])).toBeTruthy(); // 근거
    expect(getByText('아쉽게 밀린 후보들')).toBeTruthy(); // 후보 섹션
  });

  it('진행도: Q1은 progressbar 25%, ← 이전은 홈으로 복귀', () => {
    const { getByRole } = at();
    fireEvent.click(getByRole('button', { name: /30초 만에 내 카드 찾기/ }));
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25');
    fireEvent.click(getByRole('button', { name: /이전/ }));
    // 홈 복귀 → 히어로 CTA 다시 노출
    expect(getByRole('button', { name: /30초 만에 내 카드 찾기/ })).toBeTruthy();
  });

  it('홈 제도 칩 5개는 각 상세 경로로 링크된다', () => {
    const { getByRole } = at();
    const cases: [RegExp, string][] = [
      [/^기후동행카드$/, '/transit/cards/climate'],
      [/^K-패스$/, '/transit/cards/kpass'],
      [/The 경기패스/, '/transit/cards/gyeonggi'],
      [/인천 I-패스/, '/transit/cards/incheon'],
      [/후불 교통카드/, '/transit/cards/postpaid'],
    ];
    for (const [name, href] of cases) {
      expect(getByRole('link', { name }).getAttribute('href')).toBe(href);
    }
  });

  it('홈 "5개 카드 한눈에 비교하기" 링크는 비교 화면을 노출한다', () => {
    const { getByRole } = at();
    fireEvent.click(getByRole('button', { name: /5개 카드 한눈에 비교하기/ }));
    expect(getByRole('heading', { name: /다섯 장, 한눈에 비교/ })).toBeTruthy();
  });

  it('비교 화면의 "← 홈으로"는 홈 히어로로 복귀한다', () => {
    const { getByRole } = at();
    fireEvent.click(getByRole('button', { name: /5개 카드 한눈에 비교하기/ }));
    fireEvent.click(getByRole('button', { name: /← 홈으로/ }));
    expect(getByRole('button', { name: /30초 만에 내 카드 찾기/ })).toBeTruthy();
  });

  it('"답 바꿔서 다시 해볼래"는 Q1(진행도 리셋)로 돌아간다', () => {
    const { getByRole } = at();
    answerAllQuestions(getByRole);
    fireEvent.click(getByRole('button', { name: /답 바꿔서 다시 해볼래/ }));
    expect(getByRole('heading', { name: '어디 살아?' })).toBeTruthy();
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25');
  });

  it('?s=compare 딥링크로 진입하면(효과 이후) 비교 화면이 노출된다', async () => {
    const { getByRole } = at('/?s=compare');
    await waitFor(() => expect(getByRole('heading', { name: /다섯 장, 한눈에 비교/ })).toBeTruthy());
  });
});
