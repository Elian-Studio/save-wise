import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Hub } from './pages/Hub';
import { YouthSavings } from './services/youthSavings/YouthSavings';
import { Transit } from './services/transit/Transit';

// 클라(BrowserRouter)·서버(StaticRouter) 공용 라우트 트리.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Hub />} />
        <Route path="/youth-savings" element={<YouthSavings />} />
        <Route path="/transit" element={<Transit />} />
      </Route>
    </Routes>
  );
}
