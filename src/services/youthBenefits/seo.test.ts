import { describe, it, expect } from 'vitest';
import { programSeos } from './seo';
import { ROUTE_SEO } from '@/seo/routes';
import { BENEFITS } from '@/data/youthBenefits';

describe('청년 제도 상세 SEO 파생(programSeos)', () => {
  it('BENEFITS 4개에서 파생 — path/title/canonical 형식', () => {
    expect(programSeos).toHaveLength(BENEFITS.length);
    for (const b of BENEFITS) {
      const seo = programSeos.find((s) => s.path === `/youth-benefits/programs/${b.id}`);
      expect(seo).toBeTruthy();
      expect(seo!.title).toBe(`${b.name} 조건·자격·신청방법 (2026)`);
      expect(seo!.canonical).toBe(`https://choicewise.kr/youth-benefits/programs/${b.id}`);
      expect(seo!.keywords).toContain(`${b.name} 조건`);
      // FAQPage LD가 포함돼야 함
      expect(seo!.jsonLd.some((o) => (o as { '@type'?: string })['@type'] === 'FAQPage')).toBe(true);
    }
  });

  it('4개 모두 ROUTE_SEO에 등록돼 프리렌더 대상이다', () => {
    for (const b of BENEFITS) {
      const path = `/youth-benefits/programs/${b.id}`;
      expect(ROUTE_SEO.some((s) => s.path === path)).toBe(true);
    }
  });
});
