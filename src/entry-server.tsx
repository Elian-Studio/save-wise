import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// 빌드 타임 프리렌더용. dist/index.html의 #root에 주입된다(scripts/prerender.mjs).
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
