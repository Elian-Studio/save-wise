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
