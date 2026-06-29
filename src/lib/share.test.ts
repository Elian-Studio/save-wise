import { describe, it, expect } from 'vitest';
import { encodeShare, decodeShare, readShareFromUrl, type ShareState } from './share';
import { MAN } from '../data/products';
import type { Inputs } from './calc';

const inputs: Inputs = {
  scenario: 'new',
  salary: 3000,
  goal: 'amount',
  elapsed: 18,
  paidCount: 18,
  leapMonthly: 70 * MAN,
  leapRate: 0.045,
  miraeMonthly: 50 * MAN,
  type: 'pref',
  payBank: 'kakao',
  mainBank: '',
  cardCo: 'nh',
  cardSpend: true,
  autoTransfer: true,
  advisory: false,
  bankMode: 'auto',
  manualBank: '',
  investReturn: 0.07,
};
const state: ShareState = { inputs, birth: '1997-05-10', leapStart: '2024-12' };

describe('공유 상태 직렬화/복원', () => {
  it('encode→decode 라운드트립이 원본과 동일', () => {
    expect(decodeShare(encodeShare(state))).toEqual(state);
  });
  it('URL-safe — +,/,= 미포함', () => {
    expect(encodeShare(state)).not.toMatch(/[+/=]/);
  });
  it('손상된 입력은 null', () => {
    expect(decodeShare('!!!not-base64!!!')).toBeNull();
  });
  it('readShareFromUrl: ?s= 없으면 null', () => {
    expect(readShareFromUrl('?foo=1')).toBeNull();
  });
  it('readShareFromUrl: 유효한 ?s= 복원', () => {
    expect(readShareFromUrl(`?s=${encodeShare(state)}`)).toEqual(state);
  });
});
