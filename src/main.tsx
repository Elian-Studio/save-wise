import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import './index.css';
import { Flow } from './lib/flowmvp';

// FlowMVP 방문자 분석(페이지뷰·스크롤·이탈 자동 추적). 클라이언트에서만 실행.
// prod가 아니면 serviceKey에 env가 붙어(choice-wise-dev) 환경별로 분리됨.
Flow.init({
  serviceKey: 'choice-wise',
  serverUrl: 'https://track.choicewise.kr',
  env: import.meta.env.PROD ? 'prod' : 'dev',
});

const rootEl = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);

// prod(빌드): #root에 경로별 프리렌더 마크업이 있으므로 hydrate(크롤 가능성 유지).
// dev: #root가 비어 있으므로 createRoot(하이드레이션 미스매치·인터랙션 먹통 방지).
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
