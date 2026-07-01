import { useEffect } from 'react';
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

  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center gap-4 px-[18px] py-2.5">
          <Link to="/" className="font-extrabold tracking-tight text-navy">
            choicewise
          </Link>
          <Link to="/transit" className="text-sm text-muted-foreground hover:text-foreground">
            K-패스 카드
          </Link>
          <Link
            to="/youth-savings"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            청년적금 갈아타기
          </Link>
        </div>
      </nav>

      <Outlet />

      <footer className="mt-9 border-t bg-white">
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
