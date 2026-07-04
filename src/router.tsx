import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { YouthSavings } from './services/youthSavings/YouthSavings';
import { Transit } from './services/transit/Transit';

// 클라(BrowserRouter)·서버(StaticRouter) 공용 라우트 트리.
// 홈(/)은 청년적금 계산기(리치 콘텐츠·SEO), 다른 서비스는 자체 경로. 별도 허브 없음.
// 옛 /youth-savings 링크는 vercel.json에서 / 로 301 리다이렉트.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<YouthSavings />} />
        <Route path="/transit" element={<Transit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
