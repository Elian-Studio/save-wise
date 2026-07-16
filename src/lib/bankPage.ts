// 은행별 청년미래적금 상세 페이지용 순수 파생 헬퍼 (프레임워크 무관).
// 엔진(calc.ts)을 재사용해 "우대조건 모두 충족" 시의 최고금리·예상수령액을 계산한다.
// 항목별 %p·충족조건 원문은 banks.ts(은행연합회 소비자포털 정본) 단일 출처.

import type { Bank } from '../data/banks';
import { MIRAE } from '../data/products';
import { bankRate, miraeContribMonthly, product, type Inputs, type MiraeType, type ProductResult } from './calc';

const MAX_MONTHLY_WON = MIRAE.maxMonthlyMan * 10000; // 월 50만 = 한도

// 이 은행의 모든 우대를 충족하는 최대 입력. bankRate가 조건부로 각 우대를 합산하므로,
// 전 항목을 이 은행으로 지정하면 "조건 모두 충족" 상한이 나온다(총합은 기관 상한으로 캡).
export function bankMaxInputs(bank: Bank, type: MiraeType): Inputs {
  return {
    scenario: 'new',
    salary: 3000, // ≤3600 → 저소득 공통우대 포함(진짜 상한)
    goal: 'amount',
    elapsed: 0,
    paidCount: 0,
    leapMonthly: 0,
    leapRate: 0.06, // switch 전용, 'new'에선 미사용
    miraeMonthly: MAX_MONTHLY_WON,
    type,
    payBank: bank.id,
    mainBank: bank.id,
    cardCo: bank.id,
    cardSpend: true,
    autoTransfer: true,
    advisory: true,
    bankMode: 'manual',
    manualBank: bank.id,
    investReturn: 0,
  };
}

// 적용금리는 type과 무관(정부기여금률만 다름)하므로 gen으로 계산.
export function bankMaxRate(bank: Bank): number {
  return bankRate(bank, bankMaxInputs(bank, 'gen')).r;
}

export function bankEstimate(bank: Bank, type: MiraeType): ProductResult {
  return product(MAX_MONTHLY_WON, MIRAE.termMonths, bankMaxRate(bank), miraeContribMonthly(MAX_MONTHLY_WON, type));
}

export interface PrefLine {
  label: string;
  pp: number; // %p (소수)
  cond: string;
}

// 우대금리 구성 표. banks.ts의 non-null 항목 + MIRAE 공통우대. 합계는 기관 상한으로 캡되므로
// 라인 합이 achieved max를 초과할 수 있다(UI에서 캡 안내).
export function bankPrefLines(bank: Bank): PrefLine[] {
  const lines: PrefLine[] = [{ label: '기본금리', pp: MIRAE.baseRate, cond: '전 기관 공통' }];
  if (bank.salaryPref != null) lines.push({ label: '급여이체', pp: bank.salaryPref, cond: bank.salaryCond });
  if (bank.cardPref != null) lines.push({ label: '카드·실적', pp: bank.cardPref, cond: bank.cardCond });
  if (bank.switchPref != null) lines.push({ label: '도약연계·첫거래', pp: bank.switchPref, cond: bank.switchCond });
  if (bank.launchBonus > 0) lines.push({ label: '출시·한시', pp: bank.launchBonus, cond: '가입기간 내 전원 자동' });
  lines.push({ label: '공통우대 소득+', pp: MIRAE.lowIncomeBonus, cond: '총급여 3,600만원 이하' });
  lines.push({ label: '공통우대 재무상담', pp: MIRAE.advisoryBonus, cond: '청년 재무상담 이수' });
  return lines;
}
