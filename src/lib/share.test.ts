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

  it('비ASCII 문자열도 라운드트립(UTF-8 안전)', () => {
    const utf8: ShareState = { ...state, inputs: { ...inputs, manualBank: '한글은행🏦' } };
    expect(decodeShare(encodeShare(utf8))).toEqual(utf8);
  });

  it('구버전 링크(필드 누락)는 그대로 부분 복원 — DEFAULTS 머지용', () => {
    const partial: Partial<Inputs> = { ...inputs };
    delete partial.investReturn;
    const link = encodeShare({ ...state, inputs: partial } as unknown as ShareState);
    const decoded = decodeShare(link);
    expect(decoded?.inputs).not.toHaveProperty('investReturn');
    expect(decoded?.inputs?.salary).toBe(inputs.salary);
  });

  it('손상된 숫자(경계 밖)는 복원 시 클램프', () => {
    const bad = { ...inputs, elapsed: 9999, paidCount: -5, salary: -100, leapMonthly: -1 };
    const link = encodeShare({ ...state, inputs: bad } as ShareState);
    const got = decodeShare(link)?.inputs;
    expect(got?.elapsed).toBe(60); // 0..60
    expect(got?.paidCount).toBe(0);
    expect(got?.salary).toBe(0); // 음수 금액 → 0
    expect(got?.leapMonthly).toBe(0);
  });
});
