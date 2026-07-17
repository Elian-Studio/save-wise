import { describe, expect, it } from 'vitest';
import { parseMdLinks, stripMdLinks } from './mdlink';

describe('parseMdLinks — 가이드 마크다운 링크 파서', () => {
  it('링크가 없으면 원문 그대로 반환한다', () => {
    expect(parseMdLinks('그냥 문장입니다.')).toEqual(['그냥 문장입니다.']);
  });

  it('내부 링크를 토큰으로 분해한다', () => {
    expect(parseMdLinks('앞 [계산기](/youth-savings) 뒤')).toEqual([
      '앞 ',
      { label: '계산기', href: '/youth-savings' },
      ' 뒤',
    ]);
  });

  it('한 문단의 여러 링크를 모두 분해한다', () => {
    const tokens = parseMdLinks('[A](/a) 그리고 [B](https://b.example)');
    expect(tokens).toEqual([
      { label: 'A', href: '/a' },
      ' 그리고 ',
      { label: 'B', href: 'https://b.example' },
    ]);
  });

  it('문장 끝 링크에서 잔여 undefined 없이 끝난다', () => {
    expect(parseMdLinks('보세요: [여기](/guide)')).toEqual([
      '보세요: ',
      { label: '여기', href: '/guide' },
    ]);
  });

  it('괄호가 포함된 URL(위키·정부 문서)을 자르지 않는다', () => {
    expect(parseMdLinks('[위키](https://en.wikipedia.org/wiki/Tax_(finance)) 참고')).toEqual([
      { label: '위키', href: 'https://en.wikipedia.org/wiki/Tax_(finance)' },
      ' 참고',
    ]);
  });

  it('라벨 속 대괄호는 미지원 — 리터럴로 남는다(문서화된 한계)', () => {
    expect(parseMdLinks('[[중요]링크](/x)')).toEqual(['[[중요]링크](/x)']);
  });
});

describe('stripMdLinks — JSON-LD·meta용 플레인 텍스트', () => {
  it('링크를 라벨만 남기고 제거한다', () => {
    expect(stripMdLinks('자세한 건 [K-패스 총정리](/transit/cards/kpass)를 보세요.')).toBe(
      '자세한 건 K-패스 총정리를 보세요.',
    );
  });

  it('링크가 없으면 원문 그대로다', () => {
    expect(stripMdLinks('평범한 답변')).toBe('평범한 답변');
  });
});
