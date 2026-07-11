import { describe, it, expect } from 'vitest';
import { recommend } from './youthBenefitRec';
import type { QuizAnswers, BenefitItem } from './youthBenefitRec';
import { BENEFITS, RELATED, ENDED, MEDIAN_INCOME_2026, QUIZ_QUESTIONS } from '../data/youthBenefits';

// 저소득·독립·구직 청년: 4개 제도가 모두 걸리는 리치 베이스.
const base: QuizAnswers = {
  age: 'y2024',
  military: 'no',
  household: '1',
  income: 'u150', // 중위 39%
  myincome: 'o50',
  housing: 'soloRent',
  job: 'jobseeker',
};
const ans = (over: Partial<QuizAnswers>): QuizAnswers => ({ ...base, ...over });
const find = (list: BenefitItem[], id: string) => list.find((x) => x.id === id);

describe('recommend — 청년 지원금 자격진단', () => {
  it('저소득 독립 구직 청년 → 내일저축·주택드림 eligible, 취업·월세 likely', () => {
    const r = recommend(base);
    expect(r.eligible.map((x) => x.id)).toEqual(['niljeo', 'jutaek']); // 연환산액 desc
    expect(r.eligible[0].status).toBe('eligible');
    expect(r.likely.map((x) => x.id)).toEqual(['chwiup', 'wolse']);
  });

  it('중위소득% 임계 ±10%p 이내 → eligible 대신 likely 강등', () => {
    // 2인 가구 b150 → 중위 48%, 50% 기준선 근처
    const r = recommend(ans({ household: '2', income: 'b150' }));
    const nil = find(r.likely, 'niljeo');
    expect(nil?.status).toBe('likely');
    expect(nil).toBeDefined();
    expect(find(r.eligible, 'niljeo')).toBeUndefined();
    expect(nil!.reasons.some((x) => x.includes('기준선(50%)'))).toBe(true);
  });

  it('본인 소득 월 50만 미만(u50) → 10만원 조건 미확인이라 내일저축 likely', () => {
    const r = recommend(ans({ myincome: 'u50' }));
    const nil = find(r.likely, 'niljeo');
    expect(nil?.status).toBe('likely');
    expect(nil!.reasons.some((x) => x.includes('월 10만원 이상인지'))).toBe(true);
  });

  it('본인 소득 없음(none) → 내일저축 탈락', () => {
    const r = recommend(ans({ myincome: 'none' }));
    expect(find(r.eligible, 'niljeo')).toBeUndefined();
    expect(find(r.likely, 'niljeo')).toBeUndefined();
  });

  it('나이 컷 — 35~39세 병역無: 취업·주택드림·월세 모두 탈락(내일저축은 39세까지 유지)', () => {
    const r = recommend(ans({ age: 'y3539', military: 'no' }));
    const ids = [...r.eligible, ...r.likely].map((x) => x.id);
    expect(ids).not.toContain('chwiup');
    expect(ids).not.toContain('jutaek');
    expect(ids).not.toContain('wolse');
    expect(find(r.eligible, 'niljeo')).toBeDefined();
  });

  it('나이 연장 — 35~39세 병역有: 취업 대상 복귀(연령 상한 가산, likely)', () => {
    const r = recommend(ans({ age: 'y3539', military: 'yes' }));
    const ch = find(r.likely, 'chwiup');
    expect(ch?.status).toBe('likely');
    expect(ch!.reasons.some((x) => x.includes('병역'))).toBe(true);
  });

  it('주택드림 — 가구 연소득 5천만 이하는 eligible, 초과 버킷은 소득 확인 필요 likely', () => {
    const under = recommend(ans({ household: '3', income: 'b250' })); // 연 3,900만
    expect(find(under.eligible, 'jutaek')?.status).toBe('eligible');

    const over = recommend(ans({ household: '3', income: 'b400' })); // 연 6,000만
    const jt = find(over.likely, 'jutaek');
    expect(jt?.status).toBe('likely');
    expect(jt!.reasons.some((x) => x.includes('연소득'))).toBe(true);
  });

  it('취업지원 재산 5억 상한 — 진단에서 확인 불가라 항상 likely(절대 eligible 아님)', () => {
    const r = recommend(base);
    const ch = find(r.likely, 'chwiup');
    expect(ch?.status).toBe('likely');
    expect(ch!.reasons.some((x) => x.includes('재산') && x.includes('5억'))).toBe(true);
    expect(find(r.eligible, 'chwiup')).toBeUndefined();
  });

  it('무주택 플래그 off(자가 보유) → 주택드림·월세 탈락', () => {
    const r = recommend(ans({ housing: 'own' }));
    const ids = [...r.eligible, ...r.likely].map((x) => x.id);
    expect(ids).not.toContain('jutaek');
    expect(ids).not.toContain('wolse');
  });

  it('미취업 플래그 off(재직 중) → 국민취업 탈락', () => {
    const r = recommend(ans({ job: 'working' }));
    const ids = [...r.eligible, ...r.likely].map((x) => x.id);
    expect(ids).not.toContain('chwiup');
  });

  it('월세는 자격을 충족해도 2026 신규 신청 마감(3.30~5.29)이라 eligible이 아니라 likely', () => {
    const r = recommend(base);
    const wl = find(r.likely, 'wolse');
    expect(wl?.status).toBe('likely');
    expect(wl!.caveat).toBeTruthy();
    expect(wl!.reasons.some((x) => x.includes('마감') && x.includes('마이홈'))).toBe(true);
    expect(find(r.eligible, 'wolse')).toBeUndefined();
  });

  it('종료 제도는 입력과 무관하게 항상 ended 3개', () => {
    const r = recommend(base);
    expect(r.ended.map((x) => x.id)).toEqual(['doyak', 'naechae', 'jaejik']);
  });

  it('참고 카드는 항상 mirae·kpass, kpass엔 자격/환급 수치를 넣지 않는다', () => {
    const r = recommend(base);
    expect(r.related.map((x) => x.id)).toEqual(['mirae', 'kpass']);
    const kpass = r.related.find((x) => x.id === 'kpass')!;
    expect(/\d/.test(kpass.summary)).toBe(false);
    expect('amountLabel' in kpass).toBe(false);
  });

  it('전원 미자격(40세+·고소득·자가·재직) → eligible·likely 비어도 related·ended는 유지', () => {
    const r = recommend(
      ans({ age: 'over', household: '4', income: 'o800', myincome: 'none', housing: 'own', job: 'working' }),
    );
    expect(r.eligible).toHaveLength(0);
    expect(r.likely).toHaveLength(0);
    expect(r.related).toHaveLength(2);
    expect(r.ended).toHaveLength(3);
  });
});

describe('데이터 무결성', () => {
  it('2026 기준 중위소득 표(복지부 고시)와 1:1 일치', () => {
    expect(MEDIAN_INCOME_2026).toEqual({
      '1': 2564238,
      '2': 4199292,
      '3': 5359036,
      '4': 6494738,
      '5': 7556719,
      '6plus': 8555952,
    });
  });

  it('카드 구성 — 자격 4 / 참고 2 / 종료 3, 퀴즈 7문항', () => {
    expect(BENEFITS).toHaveLength(4);
    expect(RELATED).toHaveLength(2);
    expect(ENDED).toHaveLength(3);
    expect(QUIZ_QUESTIONS).toHaveLength(7);
    expect(QUIZ_QUESTIONS.map((q) => q.id)).toEqual([
      'age',
      'military',
      'household',
      'income',
      'myincome',
      'housing',
      'job',
    ]);
  });
});
