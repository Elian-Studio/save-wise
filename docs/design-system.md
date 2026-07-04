# ChoiceWise 디자인 시스템

> `choicewise.kr`의 실제 코드에 존재하는 디자인 규칙을 정리한 참조 문서.
> 값은 전부 소스에서 인용했다(파일:라인). 새 토큰/컴포넌트를 발명하지 않았고,
> 현재 코드와 불일치하는 항목은 마지막 [Known gaps](#10-known-gaps) 섹션에 따로 모았다.
>
> `Last updated 2026-07-02 · Owner daniel · SSOT src/index.css`

## 1. 디자인 원칙

코드·문구에서 관찰된 원칙만 명문화(발명 없음). 새 컴포넌트·색·카피 결정 시 판단 기준.

- **명료성 우선** — 계산 결과가 주인공. navy 잉크로 숫자·결론을 또렷이, 근거는 `<details>`로 접어 노이즈 제거.
- **신뢰·정직** — "참고용 추정", "보장되지 않습니다", 기준일·출처 병기. 수익 단정·과장 금지 — 금융 자문이 아님.
- **한국어 우선 타이포** — `word-break: keep-all`로 어절 단위 줄바꿈. 'NH농협', '도약 월 3만원' 중간 깨짐 방지.
- **절제된 금융 팔레트** — 토스풍 그린·그레이. 의미색(green=이득·blue=정보·amber=주의)만 강조에 쓰고 남발하지 않음.

## 2. 개요

- **스택**: React 19 + TypeScript + Vite, Tailwind CSS **v4 (CSS-first)**, 수동 작성한 shadcn 스타일 프리미티브.
- **토큰 단일 소스**: 모든 디자인 토큰이 [`src/index.css`](../src/index.css)에 있다. `tailwind.config.*` / `postcss.config.*` 파일은 **없다**.
- Tailwind는 `vite.config.ts`의 `@tailwindcss/vite` 플러그인으로 로드된다. 따라서 커스텀 토큰은 `index.css`의 `@theme inline` 블록에만 존재하며, spacing / breakpoint / (sans 외) fontFamily 확장은 없다 → Tailwind v4 기본 스케일을 그대로 쓴다.
- 클래스 조합 유틸 `cn()`은 [`src/lib/utils.ts`](../src/lib/utils.ts)의 정석 shadcn 구현(`twMerge(clsx(inputs))`).

## 3. Foundations (기초 토큰)

`:root` (index.css 7–28줄) — shadcn 변수 매핑 (라이트만 정의):

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius` | `0.75rem` | 기준 반경 |
| `--background` | `#edf1f5` | 페이지 배경 (연회색) |
| `--foreground` | `#191f28` | 본문 텍스트 |
| `--card` / `--popover` | `#ffffff` | 카드·팝오버 배경 |
| `--primary` / `--ring` | `#12b886` | 토스 그린, 브랜드·CTA·포커스 링 |
| `--primary-foreground` | `#ffffff` | primary 위 텍스트 |
| `--secondary` | `#f2f4f6` / fg `#333d4b` | 보조 배경 |
| `--muted` | `#f9fafb` / fg `#8b95a1` | 흐린 배경·보조문구 |
| `--accent` | `#e7f7f1` / fg `#0b6b4f` | 소프트 그린 틴트 (hover 등) |
| `--destructive` | `#f04452` / fg `#ffffff` | 위험·삭제 |
| `--border` | `#e5e8eb` | 경계선 |
| `--input` | `#d1d6db` | 입력 테두리 |

**반경 스케일** (`@theme inline` 50–53줄, `--radius 0.75rem` 기준 파생):

| 유틸 | 계산식 | 값 |
|------|--------|-----|
| `--radius-sm` | `calc(var(--radius) - 4px)` | 0.5rem |
| `--radius-md` | `calc(var(--radius) - 2px)` | 0.625rem |
| `--radius-lg` | `var(--radius)` | 0.75rem |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 1rem |

**폰트** (`--font-sans`, 67–68줄):

```
'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif
```

> ⚠️ Pretendard는 스택 1순위지만 실제로 로드되지 않는다 → [Known gaps](#7-known-gaps) 참조.

**전역 base** (`@layer base`, 71–84줄):

- `body`에 배경/색/`font-sans`, `-webkit-font-smoothing: antialiased`
- **한글 줄바꿈 규칙**: `word-break: keep-all;` + `overflow-wrap: anywhere;` — 어절 단위로만 줄바꿈해 `NH농협`, `도약 월 3만원` 같은 중간 깨짐 방지.
- `* { border-color: var(--border) }` — 테두리 기본색 통일.

## 4. Semantic tokens (금융 시맨틱 색)

`@theme inline` 57–66줄. shadcn 변수와 **별개**로 도메인(금융) 의미 색을 둔다. Toss 스타일.

| 토큰 | 값 | soft (배경) | 의미 |
|------|-----|-------------|------|
| `--color-navy` / `--color-ink` | `#191f28` | — | 잉크(진회색). 헤더·제목·CTA |
| `--color-navy2` | `#333d4b` | — | 헤더 그라데이션 하단, 보조 잉크 |
| `--color-line` | `#e5e8eb` | — | 구분선 |
| `--color-fin-green` | `#00a860` | `--color-fin-green-soft #e7f7f1` | 절약·양수(이득) |
| `--color-fin-blue` | `#3182f6` | `--color-fin-blue-soft #eaf2fe` | 정보·보조 (accent 그린과 분리) |
| `--color-fin-amber` | `#b45309` | `--color-fin-amber-soft #fdf2e2` | 주의·경고 |

Tailwind 유틸로 `bg-fin-green-soft text-fin-green`, `text-navy`, `border-line` 형태로 쓴다.

> **primary(`#12b886`) vs fin-green(`#00a860`)** — 둘 다 그린이지만 역할이 다르다. primary는 브랜드/컨트롤 강조(버튼·링·슬라이더), fin-green은 계산 결과의 "절약/이득" 의미색이다. 혼용하지 않는다.

## 5. Components (재사용 프리미티브)

`src/components/ui/*` — shadcn CLI 산출물이 아니라 수동 작성한 최소 프리미티브. React 19 시그니처(`React.forwardRef` 없이 `React.ComponentProps<...>` 직접 구조분해). 아이콘은 인라인 SVG(lucide 미설치).

**오버라이드 규약**: 모든 프리미티브가 `className={cn('...base...', className)}` 패턴 → 호출부에서 클래스 덮어쓰기 가능(`tailwind-merge`가 충돌 정리).

### cva variant는 2곳뿐

**Button** ([`ui/button.tsx`](../src/components/ui/button.tsx)):

| variant | 클래스 |
|---------|--------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `outline` | `border border-input bg-card hover:bg-accent hover:text-accent-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` |

| size | 클래스 |
|------|--------|
| `default` | `h-9 px-4 py-2` |
| `sm` | `h-8 px-3 text-xs` |
| `lg` | `h-10 px-6` |

`asChild`(Radix `Slot`) 지원. base에 `focus-visible:ring-2 focus-visible:ring-ring`, `disabled:opacity-50 pointer-events-none`.

- **When to use** — 주 행동 1개엔 `default`(primary). 보조 행동은 `outline`/`secondary`, 최소 강조는 `ghost`.
- **Don't** — 한 화면에 default 버튼 여러 개로 위계 흐리기, 링크 대신 버튼 남용, 텍스트만 다른 커스텀 색 새로 만들기.

**Badge** ([`ui/badge.tsx`](../src/components/ui/badge.tsx)): base `rounded-md px-2 py-0.5 text-xs font-bold`

| variant | 클래스 |
|---------|--------|
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `outline` | `border text-foreground` |
| `green` | `bg-fin-green-soft text-fin-green` |
| `blue` | `bg-fin-blue-soft text-fin-blue` |
| `amber` | `bg-fin-amber-soft text-fin-amber` |
| `muted` | `bg-muted text-muted-foreground` |

- **When to use** — 의미대로: `green`=이득/절약, `blue`=정보/보조, `amber`=주의, `muted`=중립 라벨. 상태·분류를 짧게 표시.
- **Don't** — 의미와 다른 색(주의에 green), 긴 문장·클릭 액션을 뱃지에 담기, `green`/`blue`를 본문급 작은 글자로(대비 미달 → [§7](#7-반응형--접근성--모션)).

### 그 외 프리미티브 (cva 없음, 단일 `cn()` 문자열)

- Radix 래핑: `select.tsx`(`react-select`), `tabs.tsx`(`react-tabs`), `checkbox.tsx`, `label.tsx`
- 순수 HTML 래퍼: `card.tsx`(Card/Header/Title/Content), `input.tsx`, `table.tsx`(Table/Header/Body/Row/Head/Cell — `overflow-x-auto` 래핑)

### 위저드 전용 컨트롤 (별개 패턴)

[`components/wizard/controls.tsx`](../src/components/wizard/controls.tsx)의 `StepBadge` / `Slider`(네이티브 `<input type="range">`) / `Segments<T>`(단일선택 세그먼트) / `ToggleCard`는 **cva를 쓰지 않고** 삼항(`active ? '...' : '...'`)으로 variant를 처리한다. ui/의 cva 패턴과 별개이니 새 컨트롤을 추가할 때 어느 쪽을 따를지 의식할 것.

### 헬퍼 클래스 (`@layer components`, index.css 87–105줄)

| 클래스 | 정의 | 용도 |
|--------|------|------|
| `.sec` | `mt-7 mb-3.5 border-l-4 border-primary pl-3 text-lg font-semibold tracking-tight` | 섹션 제목(좌측 primary 바) |
| `.mini` | `mt-1 text-xs leading-relaxed text-muted-foreground` | 보조문구 |
| `summary.disc` | `flex min-h-11 ... rounded-lg border border-line bg-secondary px-4 py-3 text-[15px] font-semibold text-navy` (hover `bg-accent`, 마커 숨김) | `<details>` progressive-disclosure 요약 헤더 |

## 6. Layout & 반복 패턴

서비스 페이지([`services/youthSavings/YouthSavings.tsx`](../src/services/youthSavings/YouthSavings.tsx), [`services/transit/Transit.tsx`](../src/services/transit/Transit.tsx))가 공유하는 골격:

- **헤더**: `bg-gradient-to-br from-navy to-navy2 py-6 text-white` + `mx-auto max-w-[1080px] px-[18px]` 컨테이너 + h1 + 우측 "기준일" pill 뱃지 (두 서비스 동일, 각 파일 57·65줄)
- **본문**: `mx-auto max-w-[1080px] px-[18px] pb-20` — 동일 max-width/padding
- **2단 그리드**: `grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start`(위저드) / `[1fr_340px]`(transit) — 좌측 입력, 우측 `lg:sticky lg:top-4` LIVE 요약
- **Progressive disclosure**: `<details className="group">` + `summary.disc` + `group-open:rotate-180` 화살표. 닫혀도 콘텐츠가 DOM에 남아 프리렌더/SEO 크롤 유지.
- **셸** ([`components/Shell.tsx`](../src/components/Shell.tsx)): 브랜드 nav(`aria-current`로 active 강조) + `<Outlet/>` + 공통 푸터 + `@vercel/analytics`. 라우트 전환 시 `document.title` 동기화.

## 7. 반응형 · 접근성 · 모션

- **breakpoint**: `sm:` / `lg:`만 사용. 커스텀 breakpoint 없음(v4 기본).
  - 모바일 1단 → 데스크톱 2단(`sm:grid-cols-2`, `lg:grid-cols-[1fr_320px]`), 데스크톱 sticky 사이드바(`lg:sticky lg:top-4`)
  - 위저드 데스크톱 높이 고정(`lg:min-h-[780px]`)으로 스텝 전환 시 버튼 Y 고정, 푸터 `sticky bottom-0`(모바일 양끝 / `lg:justify-end`)
- **접근성/터치**: 컨트롤·버튼 44px 터치 타깃(`min-h-11`), 슬라이더 thumb 24px(`input.range`, index.css 117–135줄), 표는 `overflow-x-auto`로 가로 스크롤, 포커스 링 `focus-visible:ring-ring`, 시맨틱 `<nav>/<header>/<footer>` + `aria-current`
- **모션**: 애니메이션 라이브러리 없음. `tw-animate-css`(devDep)만 사용.
  - 위저드 스텝 진입: `animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out motion-reduce:animate-none`
  - Select 열림: Radix `data-[state=open]:animate-in ... fade-in-0`
  - 그 외는 CSS `transition`/`transition-transform` + 인라인 스타일(ToggleCard knob, 진행바 width)

### 색 대비 (WCAG 2.2 AA) — 실측

sRGB relative luminance 기준 실측. 본문 AA=4.5:1, 큰 글자(≥18.66px bold/≥24px)=3:1. **`text-xs`(12px) bold는 "큰 글자"가 아니라 4.5 필요.**

| 전경 / 배경 | 대비 | 판정 |
|------|-----|------|
| foreground `#191f28` / background `#edf1f5` | 14.59 | AA ✔ |
| accent-fg `#0b6b4f` / accent `#e7f7f1` | 5.87 | AA ✔ |
| fin-amber `#b45309` / amber-soft `#fdf2e2` (Badge amber) | 4.54 | AA ✔ |
| fin-blue `#3182f6` / blue-soft `#eaf2fe` (Badge blue) | 3.29 | 큰 글자만, 본문 ✘ |
| muted-foreground `#8b95a1` / background `#edf1f5` | 2.68 | AA ✘ |
| fin-green `#00a860` / green-soft `#e7f7f1` (Badge green) | 2.80 | AA ✘ |
| primary-fg `#ffffff` / primary `#12b886` (default 버튼) | 2.55 | AA ✘ |

> 브랜드 색 유지가 전제라 코드는 미변경. 보완책: 미달 색은 **큰 글자·아이콘·테두리 병행**으로 정보를 색에만 싣지 않기, primary 버튼은 대비가 필요하면 navy 텍스트 또는 더 진한 그린 검토. 결정 전까지 **알려진 제약**으로 관리.

## 8. Content — 보이스 & 톤

금융 계산 서비스 카피 규칙. [`Disclaimer.tsx`](../src/components/Disclaimer.tsx)·as-of pill 관행에서 도출.

- **Do** — "참고용 추정"·가정 명시, 기준일(`DATA_AS_OF`)·출처(은행연합회 정본) 병기, 숫자·단위·%p 정확히, 가입 전 재확인 안내.
- **Don't** — "무조건·보장·최대 수익" 단정, 자문처럼 권유, 근거 없는 비교, 기준일 없는 수치.

## 9. Governance (경량)

- **SSOT** = [`src/index.css`](../src/index.css). 토큰은 여기서만 바꾼다.
- 이 문서(`docs/design-system.html` · `.md`)는 **수기 복제** → 토큰 변경 시 **index.css → 문서 동기화 필수**(드리프트 주의). 두 문서는 서로 내용 일치 유지.
- 변경 이력·소유자·리뷰는 **git 커밋/PR**로 갈음. 별도 changelog 파일 없음.
- 시맨틱 버전·리뷰 SLA·전용 툴(zeroheight 등)은 현 규모에 **불필요**. 기여자가 늘면 그때 도입.

## 10. Known gaps

> 문서화 중 발견한 코드-문서 불일치. **여기서는 기록만 하고 코드는 수정하지 않았다.** 후속 판단용.

1. **Pretendard 미로드** — `--font-sans` 1순위가 `Pretendard`인데 `index.html`에 `<link>`도, `@font-face`도, `public/`·`src/`에 웹폰트 파일(woff/otf/ttf)도 없다(검증: `grep -rn "Pretendard\|@font-face"` + 폰트 파일 find 결과 0건). → 대부분 환경에서 `-apple-system`/맑은 고딕 등 **시스템 폰트로 폴백**된다. 의도라면 스택에서 Pretendard를 빼거나, 아니라면 CDN link/self-host 추가 필요.
2. **다크모드 미구현** — `@custom-variant dark (&:is(.dark *));`(index.css 4줄) 선언만 있고 `.dark` 팔레트 오버라이드 블록이 없다. `:root`(라이트)만 정의됨 → `dark:` 유틸이 사실상 무효.
3. **미사용 레거시 컴포넌트** — 다음은 현재 라우팅에서 도달 불가(비-테스트 import 0건 확인):
   `VerdictCard`(테스트에서만 참조), `DecisionTable`, `ComparePanels`, `BankPick`, `MiraeSummary`, `StepsGuide`. 위저드가 구 `VerdictCard`류를 대체한 흔적. **현행 아님** — 신규 작업 시 참고 대상에서 제외.
4. **접근성: 주요 색 대비 AA 미달** — Badge `green`(2.8)·`blue`(3.29), `muted-foreground` on bg(2.68), default 버튼 흰 글자 on primary(2.55)가 WCAG AA(4.5:1) 미달([§7 실측표](#색-대비-wcag-22-aa--실측)). 브랜드 색 유지 시 색 외 단서(굵기·아이콘·테두리) 병행 권장.
