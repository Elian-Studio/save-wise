import { describe, it, expect } from 'vitest';
import { ageFromBirth, elapsedFromMonth } from './dates';

// 기준일 2026-06-23 (dates.ts의 BASE_* 상수)
describe('ageFromBirth — 만 나이 (병역 차감 없음)', () => {
  it('생일 지남 → 만 29세', () => expect(ageFromBirth('1997-05-10')).toBe(29));
  it('생일 안 지남(7월생) → 한 살 적게', () => expect(ageFromBirth('1997-07-01')).toBe(28));
  it('생일 당일(6/23) 경계 → 지난 것으로', () => expect(ageFromBirth('2000-06-23')).toBe(26));
  it('생일 하루 뒤(6/24)는 아직 안 지남', () => expect(ageFromBirth('2000-06-24')).toBe(25));
  it('빈 값 → 0', () => expect(ageFromBirth('')).toBe(0));
  it('형식 오류 → 0', () => expect(ageFromBirth('abc')).toBe(0));
});

describe('elapsedFromMonth — 경과 개월 (0..60 클램프)', () => {
  it('2024-12 → 18개월', () => expect(elapsedFromMonth('2024-12')).toBe(18));
  it('기준월(2026-06) → 0', () => expect(elapsedFromMonth('2026-06')).toBe(0));
  it('미래월 → 0으로 클램프', () => expect(elapsedFromMonth('2027-01')).toBe(0));
  it('60개월 초과 → 60으로 클램프', () => expect(elapsedFromMonth('2018-01')).toBe(60));
  it('빈 값 → 0', () => expect(elapsedFromMonth('')).toBe(0));
});
