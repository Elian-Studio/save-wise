import { describe, it, expect } from 'vitest';
import {
  simpleInterest,
  leapContribMonthly,
  miraeContribMonthly,
  bankRate,
  bestBank,
  product,
  compute,
  recommend,
  type Inputs,
} from './calc';
import { MAN } from '../data/products';
import { getBank } from '../data/banks';

const man = (won: number) => Math.round(won / MAN);

const base: Inputs = {
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
  cardCo: 'kakao',
  cardSpend: true,
  autoTransfer: true,
  advisory: false,
  bankMode: 'auto',
  manualBank: '',
  investReturn: 0.07,
};

describe('도약계좌 소득구간별 월 기여금 (m=70만)', () => {
  it('≤2400 → 3.3만', () => expect(leapContribMonthly(2000, 70 * MAN)).toBe(33000));
  it('2400~3600 → 2.9만', () => expect(leapContribMonthly(3000, 70 * MAN)).toBeCloseTo(29000, 0));
  it('3600~4800 → 2.52만', () => expect(leapContribMonthly(4200, 70 * MAN)).toBeCloseTo(25200, 0));
  it('4800~6000 → 2.1만', () => expect(leapContribMonthly(5400, 70 * MAN)).toBeCloseTo(21000, 0));
  it('6000~7500 → 0', () => expect(leapContribMonthly(6500, 70 * MAN)).toBe(0));
  it('≤2400, m=30만 → 1.8만(전액 6%)', () => expect(leapContribMonthly(2000, 30 * MAN)).toBeCloseTo(18000, 0));
  it('≤2400, m=50만 → 2.7만(40×6%+10×3%)', () => expect(leapContribMonthly(2000, 50 * MAN)).toBeCloseTo(27000, 0));
});

describe('미래적금 기여금/이자 (월50만, 36개월)', () => {
  it('우대형 기여금 총액 216만', () => expect(miraeContribMonthly(50 * MAN, 'pref') * 36).toBe(2_160_000));
  it('일반형 기여금 총액 108만', () => expect(miraeContribMonthly(50 * MAN, 'gen') * 36).toBe(1_080_000));
  it('단리이자(50만,36,8%)=222만', () => expect(simpleInterest(50 * MAN, 36, 0.08)).toBeCloseTo(2_220_000, 0));
});

describe('FSC 예시 대조', () => {
  it('우대형 8% 가정 총수령 2,255만 ±15만', () => {
    const r = product(50 * MAN, 36, 0.08, miraeContribMonthly(50 * MAN, 'pref'));
    expect(man(r.principal)).toBe(1800);
    expect(man(r.contrib)).toBe(216);
    expect(man(r.total)).toBeGreaterThanOrEqual(2240);
    expect(man(r.total)).toBeLessThanOrEqual(2270);
  });
  it('일반형 7% 가정 총수령 2,110만대 ±25만', () => {
    const r = product(50 * MAN, 36, 0.07, miraeContribMonthly(50 * MAN, 'gen'));
    expect(man(r.total)).toBeGreaterThanOrEqual(2085);
    expect(man(r.total)).toBeLessThanOrEqual(2135);
  });
});

describe('은행 적용금리 매칭 (bankRate / bestBank)', () => {
  it('주거래+자동이체 → 기관 최대우대', () => {
    const nh = getBank('nh')!;
    const x = bankRate(nh, { ...base, payBank: 'nh', autoTransfer: true });
    expect(x.tier).toBe('주거래 최대우대');
    expect(x.r).toBeCloseTo(0.05 + 0.03 + 0.005, 6); // 8.5% (저소득 3000)
  });
  it('카드만(자동이체 X) → 카드 우대 검증값', () => {
    const sh = getBank('shinhan')!;
    const x = bankRate(sh, { ...base, payBank: '', cardCo: 'shinhan', autoTransfer: false });
    expect(x.tier).toBe('카드 우대');
    expect(x.r).toBeCloseTo(0.05 + 0.002 + 0.005, 6); // 5.7%
  });
  it('미공시 은행 카드 → 기본금리만', () => {
    const x = bankRate(getBank('kakao')!, { ...base, payBank: '', cardCo: 'kakao', autoTransfer: false });
    expect(x.tier).toBe('기본금리만');
  });
  it('bestBank는 14개 중 최고 금리 은행', () => {
    const b = bestBank({ ...base, payBank: 'nh', autoTransfer: true });
    expect(b.bank.id).toBe('nh');
  });
  it('주거래 은행(mainBank)+자동이체도 최대우대 부여', () => {
    const hana = getBank('hana')!;
    const x = bankRate(hana, { ...base, payBank: '', mainBank: 'hana', cardCo: '', autoTransfer: true });
    expect(x.tier).toBe('주거래 최대우대');
  });
  it('월급 은행이 미참여(etc)면 어느 참여은행도 주거래 우대 없음', () => {
    const b = bestBank({ ...base, payBank: 'etc', mainBank: 'etc', cardCo: '', autoTransfer: true });
    // 카드/주거래 매칭 없음 → 기본금리(+공통)만, tier는 기본금리만
    expect(b.tier).toBe('기본금리만');
  });
});

describe('추천 로직 분기 (compute + recommend)', () => {
  const score = (I: Inputs) => recommend(I, compute(I)).score;
  it('우대형·중반 → 전환(score≥1)', () => expect(score(base)).toBeGreaterThanOrEqual(1.0));
  it('일반형·중반도 전환 경향', () => expect(score({ ...base, type: 'gen' })).toBeGreaterThan(-1.0));
  it('만기 임박(잔여6)은 전환신호 약화', () =>
    expect(score({ ...base, elapsed: 54, paidCount: 54 })).toBeLessThan(score(base)));
  it('일반형+저소득+만기임박 → 유지/접전 가능', () =>
    expect(
      score({ ...base, type: 'gen', elapsed: 54, paidCount: 54, salary: 2000, leapRate: 0.05 }),
    ).toBeLessThanOrEqual(0.5));
  it('고소득(도약 기여금0)+일반형 → 전환', () =>
    expect(score({ ...base, salary: 6500, type: 'gen' })).toBeGreaterThanOrEqual(1.0));
});

describe('만기 임박 유지 보정', () => {
  const verdict = (I: Inputs) => recommend(I, compute(I)).verdict;
  // 일반형 + 코앞 만기(잔여4) + 은행우대 없음 + 도약 고금리 → 전환 실익 작음
  const nearGen: Inputs = {
    ...base,
    type: 'gen',
    elapsed: 56,
    paidCount: 56,
    salary: 5500,
    leapRate: 0.06,
    miraeMonthly: 10 * MAN,
    payBank: '',
    mainBank: '',
    cardCo: '',
    autoTransfer: false,
    cardSpend: false,
    advisory: false,
  };
  it('일반형 + 만기 코앞 + 전환 실익 작음 → 유지', () => expect(verdict(nearGen)).toBe('stay'));
  it('우대형은 만기 임박이어도 전환 유지(보호)', () => expect(verdict({ ...nearGen, type: 'pref' })).toBe('switch'));
});

describe('전환 은행 수동 선택 (bankMode)', () => {
  it('manual 지정 시 해당 은행으로 계산', () => {
    const C = compute({
      ...base,
      bankMode: 'manual',
      manualBank: 'ibk',
      payBank: '',
      cardCo: '',
      autoTransfer: false,
      cardSpend: false,
    });
    expect(C.bank.id).toBe('ibk');
  });
  it('auto는 최적 은행 선택', () => {
    const C = compute({ ...base, payBank: 'nh', autoTransfer: true });
    expect(C.bank.id).toBe('nh');
  });
});

describe('경계값 안정성 (유한·비음수)', () => {
  const edges: Partial<Inputs>[] = [
    { salary: 0 },
    { salary: 8000 },
    { miraeMonthly: 0 },
    { leapMonthly: 0 },
    { elapsed: 0, paidCount: 0 },
    { elapsed: 60, paidCount: 60 },
    { leapRate: 0 },
  ];
  it('모든 경계 입력에서 유한·비음수', () => {
    for (const e of edges) {
      const C = compute({ ...base, ...e });
      for (const v of [C.stay.total, C.mirae.total, C.refund.total, C.stay.eff, C.mirae.eff]) {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
