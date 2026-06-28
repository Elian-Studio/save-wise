import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 빌드 타임에 프리렌더된 #root 마크업에 하이드레이션 부착(SEO 크롤 가능성 확보).
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <App />
  </StrictMode>,
);
