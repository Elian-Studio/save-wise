import { MAN } from '../data/products';

export function won2man(won: number): number {
  return Math.round(won / MAN);
}

/** 원 → "1억 2,300만원" / "3,400만원" */
export function fmtMoney(won: number): string {
  const man = Math.round(won / MAN);
  if (Math.abs(man) >= 10000) {
    const eok = Math.trunc(man / 10000);
    const rem = Math.abs(man % 10000);
    return eok + '억' + (rem ? ' ' + rem.toLocaleString('ko-KR') + '만' : '') + '원';
  }
  return man.toLocaleString('ko-KR') + '만원';
}

export function pct(x: number): string {
  return (x * 100).toFixed(1) + '%';
}
