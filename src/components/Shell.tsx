import { useEffect, type ReactNode } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { CONTACT_EMAIL } from '../config/ads';
import { ROUTE_SEO } from '../seo/routes';

// 앱 전역 레이아웃: 상단 브랜드 내비 + <Outlet/> + 공통 푸터 + Vercel Analytics.
// FlowMVP 분석은 main.tsx에서 앱 1회 init.
export function Shell() {
  const { pathname } = useLocation();
  // 클라 라우트 전환 시 document.title 동기화 (프리렌더 head는 크롤러용, 이건 SPA UX용).
  useEffect(() => {
    const seo = ROUTE_SEO.find((s) => s.path === pathname);
    if (seo) document.title = seo.title;
  }, [pathname]);

  // 저장된 테마 선호가 없을 때만 시스템(prefers-color-scheme) 변경을 따라간다.
  // 초기 적용은 index.html의 FOUC 방지 스크립트가 담당(하이드레이션 전).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        /* private mode 등 접근 불가 — 시스템 설정을 따른다 */
      }
      if (!saved) document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-card">
        <div className="mx-auto flex max-w-[1080px] items-center gap-1 px-[18px] py-2.5">
          <Link to="/" className="mr-2 font-extrabold tracking-tight text-ink">
            choicewise
          </Link>
          <NavItem to="/" active={pathname === '/'}>
            청년적금 갈아타기
          </NavItem>
          <NavItem to="/transit" active={pathname === '/transit'}>
            교통카드 추천
          </NavItem>
          <ThemeToggle />
        </div>
      </nav>

      <Outlet />

      <footer className="mt-9 border-t bg-card">
        <div className="mx-auto max-w-[1080px] px-[18px] py-6 text-xs text-muted-foreground">
          <p>
            본 계산기들은 공개 자료 기반 <b>참고용 추정</b>입니다. 최종 결정 전 반드시 해당 기관에 확인하세요. 본
            서비스는 투자·금융 자문이 아닙니다.
          </p>
          <p className="mt-3 flex items-center gap-3">
            <a className="inline-block py-1.5 underline hover:text-foreground" href="/privacy.html">
              개인정보처리방침
            </a>
            <span aria-hidden="true">·</span>
            <a
              className="inline-block py-1.5 underline hover:text-foreground"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              문의
            </a>
          </p>
        </div>
      </footer>

      <Analytics />
    </div>
  );
}

// 라이트/다크 테마 토글. 아이콘 전환을 CSS(.dark)로 처리해 SSR 마크업과 하이드레이션이 어긋나지 않게 한다.
function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      /* private mode 등 저장 불가 — 이번 세션 토글은 유지, 선호만 미저장 */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="라이트/다크 테마 전환"
      className="ml-auto flex size-11 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
    >
      <span className="text-base dark:hidden" aria-hidden="true">
        🌙
      </span>
      <span className="hidden text-base dark:inline" aria-hidden="true">
        ☀️
      </span>
    </button>
  );
}

// 상단 메뉴 항목 — 현재 경로면 강조(active).
function NavItem({ to, active, children }: { to: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-accent text-ink' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  );
}
