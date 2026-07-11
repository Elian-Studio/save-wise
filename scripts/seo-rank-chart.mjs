#!/usr/bin/env node
// docs/seo/rank-tracking.json → 자기완결 HTML 순위 추이 차트.
// 사용: node scripts/seo-rank-chart.mjs [입력json] [출력html]
import { readFileSync, writeFileSync } from 'node:fs';

const inPath = process.argv[2] ?? 'docs/seo/rank-tracking.json';
const outPath = process.argv[3] ?? 'docs/seo/rank-chart.html';
const data = JSON.parse(readFileSync(inPath, 'utf8'));

const TEMPLATE = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>choicewise.kr 검색 순위 추이</title>
<style>
  :root {
    --surface-1: #fcfcfb; --page: #f9f9f7;
    --ink-1: #0b0b0b; --ink-2: #52514e; --muted: #898781;
    --grid: #e1e0d9; --axis: #c3c2b7; --border: rgba(11,11,11,0.10);
    --up: #006300; --down: #d03b3b;
    --s1:#2a78d6; --s2:#1baf7a; --s3:#eda100; --s4:#008300;
    --s5:#4a3aa7; --s6:#e34948; --s7:#e87ba4; --s8:#eb6834;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface-1: #1a1a19; --page: #0d0d0d;
      --ink-1: #ffffff; --ink-2: #c3c2b7; --muted: #898781;
      --grid: #2c2c2a; --axis: #383835; --border: rgba(255,255,255,0.10);
      --up: #0ca30c; --down: #d03b3b;
      --s1:#3987e5; --s2:#199e70; --s3:#c98500; --s4:#008300;
      --s5:#9085e9; --s6:#e66767; --s7:#d55181; --s8:#d95926;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); color: var(--ink-1);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: var(--ink-2); font-size: 13px; margin: 0 0 20px; }
  .card { background: var(--surface-1); border: 1px solid var(--border);
    border-radius: 8px; padding: 16px; margin-bottom: 20px; }
  .card h2 { font-size: 15px; margin: 0 0 12px; }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--ink-2); }
  .legend .sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
  .empty { color: var(--muted); font-size: 13px; padding: 12px 0; }
  svg text { font-family: inherit; }
  .tooltip { position: fixed; pointer-events: none; z-index: 10; display: none;
    background: var(--surface-1); border: 1px solid var(--border); border-radius: 6px;
    padding: 6px 10px; font-size: 12px; color: var(--ink-1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: var(--muted); font-weight: 600; font-size: 12px;
    padding: 6px 8px; border-bottom: 1px solid var(--axis); }
  td { padding: 6px 8px; border-bottom: 1px solid var(--grid);
    font-variant-numeric: tabular-nums; }
  td.kw { color: var(--ink-1); }
  .chip { font-weight: 600; }
  .chip.up { color: var(--up); } .chip.down { color: var(--down); }
  .chip.flat, .chip.na { color: var(--muted); font-weight: 400; }
  .chip.new { color: var(--up); } .chip.out { color: var(--down); }
  .note { color: var(--muted); font-size: 12px; line-height: 1.6; }
  .scroll { overflow-x: auto; }
</style>
</head>
<body>
<div class="wrap">
  <h1>choicewise.kr 검색 순위 추이</h1>
  <p class="sub" id="meta"></p>
  <div id="charts"></div>
  <div class="card scroll">
    <h2 id="tableTitle">전체 키워드 변화</h2>
    <table id="deltaTable"></table>
  </div>
  <p class="note">네이버는 웹문서 API 랭킹(통합검색 SERP와 다름), 구글은 미국 리전 근사치 —
    절대 순위가 아니라 <b>추이 비교용</b>. 미노출(null)은 선을 끊어 표시.</p>
</div>
<div class="tooltip" id="tip"></div>
<script>
var DATA = __DATA__;

var ENGINES = [{ key: 'naver', label: '네이버 (웹문서, display 30)' },
               { key: 'google', label: '구글 (미국 리전 근사)' }];
var SLOTS = ['--s1','--s2','--s3','--s4','--s5','--s6','--s7','--s8'];
var snaps = DATA.snapshots;
var kws = DATA.keywords.map(function (k) { return k.query; });

document.getElementById('meta').textContent =
  DATA.site + ' · 스냅샷 ' + snaps.length + '회 (' +
  snaps[0].date + ' ~ ' + snaps[snaps.length - 1].date + ')';

function rankOf(snap, kw, engine) {
  var r = snap.results[kw];
  if (!r || !r[engine]) return undefined;      // 미측정
  return r[engine].rank;                       // 숫자 또는 null(미노출)
}

function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
var tip = document.getElementById('tip');

function buildChart(engine) {
  // 한 번이라도 진입한 키워드만 선으로 그린다. 나머지는 표가 커버.
  var ranked = kws.filter(function (kw) {
    return snaps.some(function (s) { var r = rankOf(s, kw, engine.key); return typeof r === 'number'; });
  });
  var card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = '<h2>' + engine.label + '</h2>';
  if (!ranked.length) {
    card.innerHTML += '<div class="empty">아직 진입한 키워드 없음 — 진입 시 여기에 추이 선이 그려집니다.</div>';
    return card;
  }
  var over = ranked.length > 8 ? ranked.length - 8 : 0;
  ranked = ranked.slice(0, 8); // ponytail: 팔레트 8슬롯 상한, 초과분은 표로만. 9개 진입하면 small multiples 검토.

  var W = 900, H = 300, PAD = { l: 44, r: 170, t: 16, b: 30 };
  var iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  var maxRank = 30;
  ranked.forEach(function (kw) { snaps.forEach(function (s) {
    var r = rankOf(s, kw, engine.key);
    if (typeof r === 'number' && r > maxRank) maxRank = r;
  }); });
  var x = function (i) { return PAD.l + (snaps.length === 1 ? iw / 2 : i * iw / (snaps.length - 1)); };
  var y = function (r) { return PAD.t + (r - 1) * ih / (maxRank - 1); }; // 1위가 위

  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('width', '100%');

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  // y축 눈금(순위) + 가로 그리드
  [1, 5, 10, 15, 20, 25, 30].filter(function (t) { return t <= maxRank; }).forEach(function (t) {
    svg.appendChild(el('line', { x1: PAD.l, x2: W - PAD.r, y1: y(t), y2: y(t),
      stroke: css('--grid'), 'stroke-width': 1 }));
    svg.appendChild(el('text', { x: PAD.l - 8, y: y(t) + 4, 'text-anchor': 'end',
      'font-size': 11, fill: css('--muted') }, t + '위'));
  });
  // x축 눈금(스냅샷 날짜)
  snaps.forEach(function (s, i) {
    svg.appendChild(el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle',
      'font-size': 11, fill: css('--muted') }, s.date));
  });

  ranked.forEach(function (kw, si) {
    var color = css(SLOTS[si]);
    var pts = snaps.map(function (s, i) { return { i: i, r: rankOf(s, kw, engine.key) }; });
    // null(미노출)에서 선을 끊는다: 연속 숫자 구간만 폴리라인으로
    var run = [];
    function flush() {
      if (run.length > 1) {
        svg.appendChild(el('polyline', {
          points: run.map(function (p) { return x(p.i) + ',' + y(p.r); }).join(' '),
          fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      }
      run = [];
    }
    pts.forEach(function (p) { typeof p.r === 'number' ? run.push(p) : flush(); });
    flush();
    var last = null;
    pts.forEach(function (p) {
      if (typeof p.r !== 'number') return;
      last = p;
      var dot = el('circle', { cx: x(p.i), cy: y(p.r), r: 5, fill: color,
        stroke: css('--surface-1'), 'stroke-width': 2 });
      var hit = el('circle', { cx: x(p.i), cy: y(p.r), r: 12, fill: 'transparent' });
      hit.addEventListener('mousemove', function (ev) {
        var res = snaps[p.i].results[kw][engine.key];
        tip.style.display = 'block';
        tip.style.left = (ev.clientX + 12) + 'px';
        tip.style.top = (ev.clientY + 12) + 'px';
        tip.textContent = snaps[p.i].date + ' · ' + kw + ' — ' + p.r + '위 / ' + (res.of || '?') + '개 중';
      });
      hit.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
      svg.appendChild(dot); svg.appendChild(hit);
    });
    if (last) { // 직접 라벨(마지막 점 오른쪽)
      svg.appendChild(el('text', { x: x(last.i) + 10, y: y(last.r) + 4,
        'font-size': 12, fill: css('--ink-2') }, kw + ' (' + last.r + '위)'));
    }
  });
  card.appendChild(svg);

  var legend = document.createElement('div');
  legend.className = 'legend';
  legend.innerHTML = ranked.map(function (kw, si) {
    return '<span><span class="sw" style="background:var(' + SLOTS[si] + ')"></span>' + kw + '</span>';
  }).join('') + (over ? '<span>… 외 ' + over + '개는 아래 표 참조</span>' : '');
  card.appendChild(legend);
  return card;
}

var charts = document.getElementById('charts');
ENGINES.forEach(function (e) { charts.appendChild(buildChart(e)); });

// 변화표: 키워드별 "최근 2회 실측정" 비교.
// 스냅샷이 일부 키워드만 담을 수 있으므로(부분 측정), 스냅샷 인덱스가 아니라
// 해당 키워드가 실제 측정된 시점(undefined 제외, null=미노출은 측정임)끼리 비교한다.
var latest = snaps[snaps.length - 1];
document.getElementById('tableTitle').textContent =
  '전체 키워드 변화 — 키워드별 최근 2회 측정 비교 (최신 스냅샷 ' + latest.date + ')';

function measurements(kw, engine) {
  var out = [];
  snaps.forEach(function (s) {
    var r = rankOf(s, kw, engine);
    if (r !== undefined) out.push({ date: s.date, r: r });
  });
  return out;
}

function chip(kw, engine) {
  var fmt = function (v) { return v === null ? '미노출' : v + '위'; };
  var m = measurements(kw, engine);
  if (!m.length) return '<span class="chip na">·</span>';
  var last = m[m.length - 1];
  // 최신 스냅샷에서 측정 안 된 키워드는 측정 시점을 병기해 오해를 막는다
  var when = last.date !== latest.date ? ' <span class="chip na">(' + last.date + ')</span>' : '';
  if (m.length === 1) return '<span class="chip flat">' + fmt(last.r) + '</span>' + when + ' <span class="chip na">첫 측정</span>';
  var pv = m[m.length - 2].r, cv = last.r;
  var pn = typeof pv === 'number', cn = typeof cv === 'number';
  if (!pn && !cn) return '<span class="chip na">미노출</span>' + when;
  var base = fmt(pv) + ' → ' + fmt(cv) + ' ';
  if (pn && cn) {
    var d = pv - cv; // 순위 숫자가 줄면 상승
    if (d > 0) return base + '<span class="chip up">▲' + d + '</span>' + when;
    if (d < 0) return base + '<span class="chip down">▼' + (-d) + '</span>' + when;
    return base + '<span class="chip flat">—</span>' + when;
  }
  return base + (cn ? '<span class="chip new">NEW</span>' : '<span class="chip out">OUT</span>') + when;
}

var rows = kws.map(function (kw) {
  return '<tr><td class="kw">' + kw + '</td>' +
    '<td>' + chip(kw, 'naver') + '</td>' +
    '<td>' + chip(kw, 'google') + '</td></tr>';
});
document.getElementById('deltaTable').innerHTML =
  '<thead><tr><th>키워드</th><th>네이버</th><th>구글</th></tr></thead><tbody>' +
  rows.join('') + '</tbody>';
</script>
</body>
</html>
`;

writeFileSync(outPath, TEMPLATE.replace('__DATA__', JSON.stringify(data)));
console.log('written: ' + outPath);
