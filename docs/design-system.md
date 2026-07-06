# ChoiceWise 디자인 시스템

> `choicewise.kr`의 실제 코드에 존재하는 디자인 규칙을 정리한 참조 문서.
> 값은 전부 소스에서 인용했다(파일:라인). 새 토큰/컴포넌트를 발명하지 않았고,
> 현재 코드와 불일치하는 항목은 마지막 [Known gaps](#10-known-gaps) 섹션에 따로 모았다.
>
> `Last updated 2026-07-04 · Owner daniel · SSOT src/index.css`

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

`:root` — shadcn 변수 매핑 (라이트). 다크 오버라이드는 [§3a](#3a-다크-팔레트-dark) 참조:

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius` | `0.75rem` | 기준 반경 |
| `--background` | `#edf1f5` | 페이지 배경 (연회색) |
| `--foreground` | `#191f28` | 본문 텍스트 |
| `--card` / `--popover` | `#ffffff` | 카드·팝오버 배경 |
| `--primary` / `--ring` | `#068068` | 토스 그린 계열, 브랜드·CTA·포커스 링 (흰 글자 AA=4.89) |
| `--primary-foreground` | `#ffffff` | primary 위 텍스트 |
| `--secondary` | `#f2f4f6` / fg `#333d4b` | 보조 배경 |
| `--muted` | `#f9fafb` / fg `#5f6b78` | 흐린 배경·보조문구 (fg는 배경/카드 위 AA≥4.5) |
| `--accent` | `#e7f7f1` / fg `#0b6b4f` | 소프트 그린 틴트 (hover 등) |
| `--destructive` | `#f04452` / fg `#ffffff` | 위험·삭제 |
| `--border` | `#e5e8eb` | 경계선 |
| `--input` | `#d1d6db` | 입력 테두리 |

> **AA 조정(2026-07-04)**: `--primary`(구 `#12b886`)·`--muted-foreground`(구 `#8b95a1`)를 WCAG AA 4.5:1을 만족하도록 어둡게 조정. 근거·실측은 [§7 색 대비](#색-대비-wcag-22-aa--실측).

**반경 스케일** (`@theme inline` 50–53줄, `--radius 0.75rem` 기준 파생):

| 유틸 | 계산식 | 값 |
|------|--------|-----|
| `--radius-sm` | `calc(var(--radius) - 4px)` | 0.5rem |
| `--radius-md` | `calc(var(--radius) - 2px)` | 0.625rem |
| `--radius-lg` | `var(--radius)` | 0.75rem |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 1rem |

**폰트** (`--font-sans`, 67–68줄):

```
'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif
```

> **Pretendard 로드 방식**: `pretendard` npm 패키지(가변 폰트, 동적 서브셋)를 self-host. `index.css` 최상단에서
> `@import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';`로 로드하며, Vite가 woff2 서브셋을
> 번들·해싱한다(빌드 산출물 `dist/assets/PretendardVariable.subset.*.woff2`). CDN 미사용.
> **1순위는 `'Pretendard Variable'`** — 서브셋 CSS가 `@font-face`로 등록하는 실제 패밀리명과 일치해야 폰트가 적용된다
> (정적 `'Pretendard'`는 미로드 폴백용 2순위). 검증: `dist` CSS의 `@font-face{font-family:Pretendard Variable}`와 `--font-sans` 1순위 일치.

**전역 base** (`@layer base`, 71–84줄):

- `body`에 배경/색/`font-sans`, `-webkit-font-smoothing: antialiased`
- **한글 줄바꿈 규칙**: `word-break: keep-all;` + `overflow-wrap: anywhere;` — 어절 단위로만 줄바꿈해 `NH농협`, `도약 월 3만원` 같은 중간 깨짐 방지.
- `* { border-color: var(--border) }` — 테두리 기본색 통일.

## 4. Semantic tokens (금융 시맨틱 색)

`@theme inline` 57–66줄. shadcn 변수와 **별개**로 도메인(금융) 의미 색을 둔다. Toss 스타일.

| 토큰 | 값 | soft (배경) | 의미 |
|------|-----|-------------|------|
| `--color-navy` | `--navy #191f28` | — | 잉크(진회색). **배너 표면**(`from-navy` 헤더 그라데이션). 두 테마 공통 다크 유지 |
| `--color-ink` | `--ink #191f28` | — | 제목·라벨·강조 **텍스트**. 다크에서 밝게 반전(`#f0f2f5`) |
| `--color-navy2` | `--navy2 #333d4b` | — | 헤더 그라데이션 하단, 보조 잉크 표면 |
| `--color-line` | `--line #e5e8eb` | — | 구분선 (다크 `#2c313b`) |
| `--color-fin-green` | `--fin-green #157a3f` | `--fin-green-soft #e7f7f1` | 절약·양수(이득). 흰 글자 5.4, soft 위 4.88 |
| `--color-fin-blue` | `--fin-blue #1b5fd0` | `--fin-blue-soft #eaf2fe` | 정보·보조. soft 위 5.18 |
| `--color-fin-amber` | `--fin-amber #b45309` | `--fin-amber-soft #fdf2e2` | 주의·경고. soft 위 4.54 |

각 `--color-*`는 `:root`/`.dark`의 `var(--토큰)`을 참조한다(예: `--color-fin-green: var(--fin-green)`) — 다크 스왑을 위해 hex 직박기에서 전환됨. Tailwind 유틸로 `bg-fin-green-soft text-fin-green`, `text-ink`, `border-line` 형태로 쓴다.

> **`text-navy` vs `text-ink`** — 배너/라이트-고정 틴트 위의 진한 텍스트는 `text-navy`(다크에서도 어두움 유지), 카드·배경 위의 제목/라벨은 `text-ink`(다크에서 밝게 반전). 라이트에서는 둘 다 `#191f28`로 동일.

> **primary(`#068068`) vs fin-green(`#157a3f`)** — 둘 다 어두운 그린이지만 hue가 다르다(primary=teal 계열, fin-green=grass 계열). primary는 브랜드/컨트롤 강조(버튼·링·슬라이더), fin-green은 계산 결과의 "절약/이득" 의미색. 혼용하지 않는다.

## 3a. 다크 팔레트 (`.dark`)

클래스 전략(`@custom-variant dark (&:is(.dark *))`, index.css). `index.html`의 FOUC 방지 인라인 스크립트가 하이드레이션 전에 `<html>`에 `.dark`를 적용(localStorage `theme` → 없으면 `prefers-color-scheme`). `Shell.tsx` 우상단 토글로 전환(localStorage 저장), 저장값 없을 때만 시스템 변경을 추종.

**설계 원칙**: 중립 표면·잉크만 반전한다. `primary`·`fin-*`(솔리드)·`fin-*-soft`(칩)·`navy`(배너)는 반전하지 않아, 솔리드 위 흰 글자와 라이트 칩 위 진한 시맨틱 텍스트가 두 테마에서 동일하게 AA를 만족한다(별도 다크 대비 계산 불필요).

| 토큰 | 라이트 | 다크 | 비고 |
|------|--------|------|------|
| `--background` | `#edf1f5` | `#16181d` | 페이지 |
| `--foreground` | `#191f28` | `#e6e9ee` | 본문 |
| `--card` / `--popover` | `#ffffff` | `#1e222b` | 표면 |
| `--secondary` | `#f2f4f6` / `#333d4b` | `#2a2f3a` / `#d3d8e0` | 보조 배경/텍스트 |
| `--muted` | `#f9fafb` / `#5f6b78` | `#262b34` / `#98a1ad` | 흐린 배경/보조문구 |
| `--accent` | `#e7f7f1` / `#0b6b4f` | `#16362a` / `#74dcae` | 저채도 그린 틴트 |
| `--border` / `--input` | `#e5e8eb` / `#d1d6db` | `#2c313b` / `#3a414d` | 경계·입력 |
| `--ink` | `#191f28` | `#f0f2f5` | 제목·라벨 텍스트 |
| `--line` | `#e5e8eb` | `#2c313b` | 구분선·슬라이더 트랙 |
| `--primary` / `--ring` | `#068068` | `#068068` (동일) | 반전 안 함(흰 글자 AA 유지) |
| `--navy` / `--navy2` | `#191f28` / `#333d4b` | 동일 | 반전 안 함(배너 표면) |
| `--fin-*` / `--fin-*-soft` | 라이트값 | 동일 | 반전 안 함(솔리드/칩 대비 유지) |

> 다크에서 `fin-*-soft` 칩(뱃지·경고 박스)은 밝은 칩으로 유지된다 — 흔한 다크 UI 패턴이며 진한 시맨틱 텍스트의 AA를 두 테마에서 그대로 보존한다. `bg-fin-blue-soft` 강조 행(`ScenarioTables`)은 밝은 띠 위에 `text-navy`(비반전 다크)를 얹어 가독성을 지킨다.

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

sRGB relative luminance 기준 실측(`scripts/`가 아닌 검증 스크립트로 산출). 본문 AA=4.5:1, 큰 글자(≥18.66px bold/≥24px)=3:1. **`text-xs`(12px) bold는 "큰 글자"가 아니라 4.5 필요.**

**AA 조정 결과 (2026-07-04)** — 미달 4종을 토큰값 조정으로 해소. `--primary`는 흰 글자 유지 원칙에 따라 **primary를 어둡게**(#12b886→#068068) 결정(전경 잉크 전환 대신) — 버튼·세그먼트·스텝 등 `bg-primary text-white` 사용처가 한 토큰으로 모두 통과하고 흰-글자-온-그린 관례를 유지하기 때문:

| 전경 / 배경 | before | after | 판정 |
|------|-----|-----|------|
| primary-fg `#ffffff` / primary (default 버튼) | 2.55 (`#12b886`) | **4.89** (`#068068`) | AA ✔ |
| fin-green / green-soft (Badge green) | 2.80 (`#00a860`) | **4.88** (`#157a3f`) | AA ✔ |
| fin-blue / blue-soft (Badge blue) | 3.29 (`#3182f6`) | **5.18** (`#1b5fd0`) | AA ✔ |
| muted-foreground / background `#edf1f5` | 2.68 (`#8b95a1`) | **4.79** (`#5f6b78`) | AA ✔ |
| muted-foreground `#5f6b78` / card `#ffffff` | — | 5.44 | AA ✔ |
| fin-amber `#b45309` / amber-soft `#fdf2e2` | 4.54 | 4.54 (유지) | AA ✔ |
| accent-fg `#0b6b4f` / accent `#e7f7f1` | 5.87 | 5.87 (유지) | AA ✔ |
| foreground `#191f28` / background `#edf1f5` | 14.59 | 14.59 (유지) | AA ✔ |
| white / fin-green 솔리드 채움(결과 카드) | 3.10 | **5.40** | AA ✔ |
| white / 메달 silver (순위 2위 뱃지·타일) | 2.45 (`#9aa6bc`) | **4.59** (`#6b7688`) | AA ✔ |
| white / 메달 bronze (순위 3위 뱃지·타일) | 3.38 (`#b97f50`) | **5.85** (`#8a5a34`) | AA ✔ |

**다크 실측(핵심)** — 전부 AA ✔: fg/bg 14.59 · ink/card 14.20 · muted-fg/card 6.09 · muted-fg/bg 6.80 · muted-fg/secondary 5.13 · ink/accent 11.74 · accent-fg/accent 7.89 · secondary-fg/secondary 9.37 · white/primary 4.89 · white/fin-green 5.40 · fin-green/green-soft(칩) 4.88 · fin-blue/blue-soft(칩) 5.18 · fin-amber/amber-soft(칩) 4.54 · navy/blue-soft(강조행) 14.69 · white/navy(배너) 16.56.

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

> 문서화 중 발견한 코드-문서 불일치. 후속 판단용.

1. **미사용 레거시 컴포넌트** — 다음은 현재 라우팅에서 도달 불가(비-테스트 import 0건 확인):
   `VerdictCard`(테스트에서만 참조), `DecisionTable`, `ComparePanels`, `MiraeSummary`, `StepsGuide`(단, `BankPick`은 정리 대상). 위저드가 구 `VerdictCard`류를 대체한 흔적. **현행 아님** — 신규 작업 시 참고 대상에서 제외.

### 해소됨 (2026-07-04)

- ~~**Pretendard 미로드**~~ → `pretendard` npm self-host + `index.css` 상단 `@import`로 로드([§3 폰트](#3-foundations-기초-토큰)). Vite가 woff2 서브셋 번들·해싱.
- ~~**다크모드 미구현**~~ → `.dark` 팔레트 + FOUC 스크립트 + `Shell` 토글 구현([§3a](#3a-다크-팔레트-dark)).
- ~~**주요 색 대비 AA 미달**~~ → `primary`·`fin-green`·`fin-blue`·`muted-foreground` 토큰값 조정으로 라이트·다크 모두 4.5:1↑ 충족([§7 실측표](#색-대비-wcag-22-aa--실측)).
