import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
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

// 빌드 타임에 경로별 프리렌더된 #root 마크업에 하이드레이션 부착(SEO 크롤 가능성 확보).
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
