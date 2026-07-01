# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Implemented and deployed at **choicewise.kr** (Vercel). Stack: **React 19 + TypeScript + Vite**, Radix/shadcn UI, SCSS-free Tailwind utility classes, build-time **SSG prerender** (`scripts/prerender.mjs` + `entry-server.tsx`), Vercel Web Analytics. Scripts: `npm run dev / build / test / typecheck / lint / format`. Tests are Vitest + Testing Library.

`save-wise` (brand: **choicewise**) is an interactive web **calculator** with two modes: **갈아타기** (도약계좌 보유자 → 미래적금 전환 유지/전환 추천) and **신규 가입** (미래적금 신규 가입자용 예상 수령액·최적 은행). The pure, framework-free calculation engine lives in `src/lib/calc.ts` with single-source data in `src/data/`.

**Docs location:** all project documents (specs, analyses, reports) live under **`docs/`**. Do not create a `claudedocs/` directory in this repo — it overrides the default global convention.

## Source of truth: the calc spec

`docs/calc-spec-draft.md` is the authoritative specification for the calculation engine, scenario branching, and recommendation logic. **Read it before writing any calculation code.** The financial math is the core of this product — correctness matters more than UI.

Key conventions in the spec:
- **`[R]` markers** flag values/rules that are still *unconfirmed* and must be finalized via deep-research (e.g. exact government-matching rates, the mid-term-cancellation rule `C2`, per-bank preferential-rate tables). Treat any `[R]` value as a placeholder, not a fact. Do not hard-code an `[R]` number into the engine as if settled — surface it as a parameter and note its provenance.
- **`C2` (해지환급금 / mid-term cancellation)** is the highest-leverage unknown: whether switching out of 도약계좌 preserves or forfeits the accrued government contribution / interest / tax-exemption swings the entire "switch" path. The recommendation can flip on this alone.

## Calculation architecture (the comparison framing)

The whole product hinges on comparing fairly, because the two products differ in maturity, monthly cap, rate, and government contribution — so naïve maturity-amount comparison is invalid. The engine is built around **three comparison axes** and **two paths**:

- **Path "Stay"**: keep 도약계좌 to its 60-month maturity → principal + full-term interest + full government contribution.
- **Path "Switch"**: cancel 도약계좌 now (→ `C2` 해지환급금) + open 미래적금 to its 36-month maturity (→ principal + bank-rate interest + 미래 contribution).
- Compare via: (1) each path's own-maturity net profit / effective yield, (2) common-horizon (e.g. 36-month) asset value to absorb the term mismatch, (3) qualitative liquidity/risk. The recommendation = axis (1) net profit weighted by axis (3) situational preference (`goal`: 목돈최대 vs 유동성중시), always shown with a comparison table and 3 supporting reasons.

Interest model: free-installment, **simple interest**, both products **tax-exempt** (이자소득세 15.4% waived → pre-tax interest = post-tax). Default engine assumes a fixed monthly amount; variable contributions generalize to a per-installment sum.

When you build the engine, keep the calculation layer pure and input-driven (the spec's §1 input schema), separate from any UI, so the `[R]` constants and per-bank tables stay swappable as research lands.

## Workflow notes

- `main` was established by the bootstrap commit. **All subsequent work goes on feature branches** — do not commit application code directly to `main`.
- Local commit identity is `daniel <daniel@mobidoc.us>`; the GitHub remote (`origin` → `Elian-Studio/save-wise`) authenticates via `gh` as `Elian-bang`.
- `.claude/settings.local.json` is gitignored (machine-local permission overrides) — keep it out of commits.
- Before choosing a stack, note the Vercel target: a plain static-HTML build and a Vite/framework build need different Vercel build-command / output-dir settings. Pick deliberately when implementation starts.

## 🚨 배포 규율 — 절대 규칙 (NEVER test UI on production)

**프로덕션(choicewise.kr)은 실사용자에게 노출되는 라이브 서비스다. 절대로 테스트/디버깅 환경으로 쓰지 않는다.**

이 규칙은 반복된 실수(로컬 검증 없이 프로덕션에 배포하고, 깨진 UI를 프로덕션에서 확인·디버깅)로 인해 추가됐다. 다시는 반복하지 않는다.

- **UI/UX·레이아웃·스타일·하이드레이션 변경은 반드시 로컬 `npm run dev` + 브라우저에서 먼저 완결 검증한다.** 통과(스타일 적용·계산 동작·반응성·콘솔 에러 0)한 것만 커밋·push한다.
- **"배포해서 확인" 금지.** 라이브에 올려놓고 스타일/레이아웃이 맞는지 보는 행위 자체가 위반이다. 검증은 로컬에서 끝낸다.
- **깨진 것을 프로덕션에서 디버깅하지 않는다.** 문제가 의심되면 로컬에서 재현·수정한다. 로컬에서 재현 안 되는 배포-측 문제(캐시·에셋 해시 등)는 **먼저 사용자에게 알리고**, 프로덕션을 추가로 건드리기 전에 원인을 규명한다.
- 배포 후 라이브 확인은 **스모크 체크만**(HTTP 200 / title / CSS 200 정도). 스타일·상호작용 판정은 로컬에서 이미 끝나 있어야 한다.
- 사용자가 "로컬에서 확인해"라고 하면 dev 서버를 켜두고 URL을 알려줘 사용자가 직접 보게 한다. 중간에 임의로 끄지 않는다.
- `git push origin main` = Vercel 자동 프로덕션 배포(즉시). push 전에 로컬 검증이 끝났는지 스스로 확인한다. 되돌리기 어려운 라이브 반영이므로 신중히.
- 롤백이 필요하면 즉시 알리고 실행한다. 프로덕션을 반복 배포로 실험하지 않는다.
