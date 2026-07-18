import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { ROUTE_SEO } from './routes';

// ponytail: sitemap을 prerender.mjs의 ROUTE_SEO 루프에서 생성하지 않는다 — 생성 시 변경 없는
// 페이지에도 가짜 lastmod가 찍혀 정확성을 해친다. 대신 이 테스트가 ROUTE_SEO ↔ 수동 sitemap.xml
// 드리프트 가드 역할을 한다(새 라우트를 sitemap에 빠뜨리면 실패).
describe('sitemap 드리프트 가드', () => {
  it('ROUTE_SEO의 모든 path가 sitemap.xml에 <loc>로 있다', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    for (const { path } of ROUTE_SEO) {
      expect(sitemap, path).toContain(`<loc>https://choicewise.kr${path}</loc>`);
    }
  });
});
