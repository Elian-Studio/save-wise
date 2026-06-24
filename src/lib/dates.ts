// 기준일 2026-06-23 고정(계산기 데이터 기준일과 일치).
export const BASE_YEAR = 2026;
export const BASE_MONTH = 6; // 1-indexed
export const BASE_DAY = 23;

/** 생년월일(yyyy-mm-dd) → 만 나이 (기준일 2026-06-23) */
export function ageFromBirth(birth: string): number {
  if (!birth) return 0;
  const [by, bm, bd] = birth.split('-').map(Number);
  if (!by || !bm || !bd) return 0;
  const before = BASE_MONTH < bm || (BASE_MONTH === bm && BASE_DAY < bd);
  return BASE_YEAR - by - (before ? 1 : 0);
}

/** 가입 시기(yyyy-mm) → 경과 개월 0..60 */
export function elapsedFromMonth(s: string): number {
  if (!s) return 0;
  const [y, m] = s.split('-').map(Number);
  if (!y || !m) return 0;
  const e = (BASE_YEAR - y) * 12 + (BASE_MONTH - 1 - (m - 1));
  return Math.max(0, Math.min(60, e));
}
