// 클라 빌드 후 실행: SSR 빌드의 render()로 본문을 생성해 dist/index.html의 #root에 주입한다.
// 새 의존성 0 — react-dom/server 사용. SEO 크롤러가 본문 텍스트를 받게 만드는 게 목적.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dist = resolve('dist');
const serverEntry = pathToFileURL(resolve('dist/server/entry-server.js')).href;

const { render } = await import(serverEntry);
const html = render();

const indexPath = resolve(dist, 'index.html');
const shell = await readFile(indexPath, 'utf8');

const marker = '<div id="root"></div>';
if (!shell.includes(marker)) {
  throw new Error(`prerender: '${marker}' 마커를 dist/index.html에서 찾지 못함`);
}

await writeFile(indexPath, shell.replace(marker, `<div id="root">${html}</div>`), 'utf8');
await rm(resolve(dist, 'server'), { recursive: true, force: true });

console.log(`prerender: #root에 ${html.length}자 주입 완료`);
