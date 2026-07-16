import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { YouthSavings } from './services/youthSavings/YouthSavings';
import { BanksHub } from './services/youthSavings/BanksHub';
import { BankDetail } from './services/youthSavings/BankDetail';
import { YouthBenefits } from './services/youthBenefits/YouthBenefits';
import { ProgramDetail } from './services/youthBenefits/ProgramDetail';
import { Transit } from './services/transit/Transit';
import { SchemeDetail } from './services/transit/SchemeDetail';
import { CardCompare } from './services/transit/CardCompare';
import { About } from './services/site/About';
import { Contact } from './services/site/Contact';

// 클라(BrowserRouter)·서버(StaticRouter) 공용 라우트 트리.
// 홈(/)은 패스와이즈 교통카드 추천, 청년적금 계산기는 /youth-savings. 별도 허브 없음.
// 옛 /transit·구 /youth-savings 링크는 vercel.json에서 / 로 301 리다이렉트.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Transit />} />
        <Route path="/youth-savings" element={<YouthSavings />} />
        <Route path="/youth-savings/banks" element={<BanksHub />} />
        <Route path="/youth-savings/banks/:id" element={<BankDetail />} />
        <Route path="/youth-benefits" element={<YouthBenefits />} />
        <Route path="/youth-benefits/programs/:id" element={<ProgramDetail />} />
        <Route path="/transit/cards/compare/:type" element={<CardCompare />} />
        <Route path="/transit/cards/:id" element={<SchemeDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
