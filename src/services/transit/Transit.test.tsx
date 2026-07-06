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

// 시나리오: 서울 → 19~34세 → 60번 넘게 → 지하철·시내버스 → 자주 타 (승자는 엔진이 결정)
const answerFiveQuestions = (getByRole: (r: string, o: { name: RegExp }) => HTMLElement) => {
  fireEvent.click(getByRole('button', { name: /30초 만에 내 카드 찾기/ }));
  fireEvent.click(getByRole('button', { name: /^서울$/ }));
  fireEvent.click(getByRole('button', { name: /19~34세/ }));
  fireEvent.click(getByRole('button', { name: /60번 넘게/ }));
  fireEvent.click(getByRole('button', { name: /지하철·시내버스/ }));
  fireEvent.click(getByRole('button', { name: /자주 타/ }));
};

describe('패스픽 Transit', () => {
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

  it('퀴즈 플로우: 5문항 답하면 승자 상세 CTA·근거·후보가 렌더된다', () => {
    const { getByRole, getByText } = at();
    answerFiveQuestions(getByRole);
    const rec = recommend({ region: 'seoul', age: 'y', trips: 'lots', mode: 'metro', bike: 'often' });
    // 결과 화면 노출 + 승자 상세 CTA가 엔진이 고른 승자 id를 가리킴(이중 환급 반영 → K-패스)
    expect(getByRole('link', { name: /이 카드 자세히 보기/ }).getAttribute('href')).toBe(
      `/transit/cards/${rec.list[0].id}`,
    );
    expect(getByText(rec.list[0].reasons[0])).toBeTruthy(); // 근거
    expect(getByText('아쉽게 밀린 후보들')).toBeTruthy(); // 후보 섹션
  });

  it('진행도: Q1은 progressbar 20%, ← 이전은 홈으로 복귀', () => {
    const { getByRole } = at();
    fireEvent.click(getByRole('button', { name: /30초 만에 내 카드 찾기/ }));
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('20');
    fireEvent.click(getByRole('button', { name: /이전/ }));
    // 홈 복귀 → 히어로 CTA 다시 노출
    expect(getByRole('button', { name: /30초 만에 내 카드 찾기/ })).toBeTruthy();
  });

  it('홈 제도 칩 5개는 각 상세 경로로 링크된다', () => {
    const { getByRole } = at();
    const cases: [RegExp, string][] = [
      [/기후동행카드/, '/transit/cards/climate'],
      [/^K-패스$/, '/transit/cards/kpass'],
      [/The 경기패스/, '/transit/cards/gyeonggi'],
      [/인천 I-패스/, '/transit/cards/incheon'],
      [/후불 교통카드/, '/transit/cards/postpaid'],
    ];
    for (const [name, href] of cases) {
      expect(getByRole('link', { name }).getAttribute('href')).toBe(href);
    }
  });

  it('헤더 "카드 비교"는 비교 화면을 노출한다', () => {
    const { getByRole } = at();
    fireEvent.click(getByRole('button', { name: /카드 비교/ }));
    expect(getByRole('heading', { name: /다섯 장, 한눈에 비교/ })).toBeTruthy();
  });

  it('"답 바꿔서 다시 해볼래"는 Q1(진행도 리셋)로 돌아간다', () => {
    const { getByRole } = at();
    answerFiveQuestions(getByRole);
    fireEvent.click(getByRole('button', { name: /답 바꿔서 다시 해볼래/ }));
    expect(getByRole('heading', { name: '어디 살아?' })).toBeTruthy();
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('20');
  });

  it('?s=compare 딥링크로 진입하면(효과 이후) 비교 화면이 노출된다', async () => {
    const { getByRole } = at('/?s=compare');
    await waitFor(() => expect(getByRole('heading', { name: /다섯 장, 한눈에 비교/ })).toBeTruthy());
  });
});
