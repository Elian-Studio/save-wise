import { describe, it, expect } from 'vitest';
import { stripLeadingZeros } from './num';

describe('stripLeadingZeros — 선행 0 제거', () => {
  it('04000 → 4000', () => expect(stripLeadingZeros('04000')).toBe('4000'));
  it('단독 0은 유지', () => expect(stripLeadingZeros('0')).toBe('0'));
  it('빈 문자열 유지', () => expect(stripLeadingZeros('')).toBe(''));
  it('소수 0.5 유지', () => expect(stripLeadingZeros('0.5')).toBe('0.5'));
  it('04.5 → 4.5', () => expect(stripLeadingZeros('04.5')).toBe('4.5'));
  it('00.5 → 0.5', () => expect(stripLeadingZeros('00.5')).toBe('0.5'));
  it('선행 0 없으면 그대로', () => expect(stripLeadingZeros('4000')).toBe('4000'));
});
