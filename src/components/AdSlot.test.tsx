// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';

// 애드핏 단위(top)만 설정된 상태를 모의 — 나머지 슬롯은 비어 있음
vi.mock('../config/ads', () => ({
  ADS: {
    adfit: { top: 'DAN-test', mid: '', foot: '' },
    adsense: { client: '', top: '', mid: '', foot: '' },
  },
  CONTACT_EMAIL: 'test@example.com',
}));

import { Ad } from './AdSlot';

afterEach(cleanup);

describe('Ad 슬롯 렌더 분기', () => {
  it('애드핏 단위가 설정되면 kakao_ad_area ins와 "광고" 라벨을 렌더한다', () => {
    const { container, getByText } = render(<Ad slot="top" />);
    expect(container.querySelector('ins.kakao_ad_area')).not.toBeNull();
    expect(getByText('광고')).toBeTruthy();
  });

  it('설정 안 된 슬롯은 아무것도 렌더하지 않는다(null)', () => {
    const { container } = render(<Ad slot="mid" />);
    expect(container.firstChild).toBeNull();
  });
});
