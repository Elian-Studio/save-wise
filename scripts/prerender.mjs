// 클라 빌드 후 실행: SSR 빌드의 render(url)로 각 라우트 본문을 생성해 dist/<route>/index.html에 주입한다.
// 라우트별 SEO 메타(title/description/canonical/og/JSON-LD)는 renderHead()로 </head> 직전에 삽입.
// 새 의존성 0 — react-dom/server + react-router 사용. SEO 크롤러가 경로별 본문·메타를 받게 만드는 게 목적.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const dist = resolve('dist');
const serverEntry = pathToFileURL(resolve('dist/server/entry-server.js')).href;
const { render, ROUTE_SEO, renderHead } = await import(serverEntry);

const template = await readFile(resolve(dist, 'index.html'), 'utf8');
const rootMarker = '<div id="root"></div>';
if (!template.includes(rootMarker)) throw new Error(`prerender: '${rootMarker}' 마커를 찾지 못함`);
if (!template.includes('</head>')) throw new Error('prerender: </head> 를 찾지 못함');

for (const seo of ROUTE_SEO) {
  const body = render(seo.path);
  // 함수 치환 — 삽입 문자열의 $& 등 특수 replacement 패턴이 잘못 해석되는 사고 방지.
  const html = template
    .replace('</head>', () => `    ${renderHead(seo)}\n  </head>`)
    .replace(rootMarker, () => `<div id="root">${body}</div>`);
  const outFile = seo.path === '/' ? resolve(dist, 'index.html') : resolve(dist, seo.path.slice(1), 'index.html');
  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, html, 'utf8');
  console.log(`prerender: ${seo.path} → ${outFile.replace(dist, 'dist')} (${body.length}자)`);
}

await rm(resolve(dist, 'server'), { recursive: true, force: true });
