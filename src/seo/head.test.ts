import { describe, it, expect } from 'vitest';
import { renderHead, type RouteSeo } from './head';

const seo: RouteSeo = {
  path: '/',
  title: 'A "B" & <C>',
  description: '설명 "인용" & <스크립트>',
  keywords: 'k1, k2',
  canonical: 'https://choicewise.kr/?a=1&b=2',
  jsonLd: [{ '@type': 'WebApplication', name: 'x</script><script>alert(1)' }],
};

describe('renderHead — 이스케이프·필수 태그', () => {
  const html = renderHead(seo);
  it('title·canonical·JSON-LD 포함', () => {
    expect(html).toContain('<title>');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('application/ld+json');
  });
  it('속성값의 큰따옴표·꺾쇠·앰퍼샌드 이스케이프', () => {
    expect(html).toContain('&quot;'); // " → &quot;
    expect(html).toContain('&lt;C&gt;'); // < > → 엔티티
    expect(html).toContain('a=1&amp;b=2'); // canonical & 이스케이프
    expect(html).not.toContain('content="A "B"'); // 속성값에 raw " 미노출
  });
  it('JSON-LD의 < 는 \\u003c 로 이스케이프 → </script> 조기 종료 불가', () => {
    expect(html).not.toContain('</script><script>alert');
    expect(html).toContain('\\u003c');
  });
});
