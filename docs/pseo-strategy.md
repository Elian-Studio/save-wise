# choicewise 프로그래매틱 SEO 전략

기준일: 2026-07-16 · 대상: https://choicewise.kr · 근거: `src/data/*`, `docs/seo/rank-tracking.json`

## 1. Opportunity Analysis

| 플레이북 | URL 패턴 | 페이지 수 | 데이터 출처 | 방어력 | 콘텐츠 위험 |
|---|---|---|---|---|---|
| **Directory/Profiles** (권장 Phase 1) | `/youth-savings/banks/:id` | **14** | `banks.ts` — 은행연합회 정본(verified) + `calc.ts` 산출 | ★★★★☆ proprietary+product-derived | 낮음 (페이지마다 실제 계산 결과 다름) |
| **Comparison** (Phase 2) | `/transit/cards/compare/:type` | 2~3 (check/credit/전체) | `transitCards.ts` 22장 | ★★★☆☆ | 낮음 (집계 표 = 고유) |
| ~~카드사별 개별 카드 페이지~~ | ~~`/transit/cards/detail/:id`~~ | ~~22~~ | — | — | **높음 — 하지 말 것** |

**핵심 판단:** 사이트 도메인 권위가 낮고(신생), rank-tracking 상 대부분 키워드 검색량이 낮다. **수백 페이지 양산 금지.** 방어력 최고인 14개 은행 페이지 파일럿부터. 22개 카드 개별 페이지는 서로 유사(전부 "K-패스 체크")해 thin-content 페널티 위험이 커서 **집계 비교 페이지 1~3장으로 흡수**한다.

## 2. Playbook Selection: 은행별 미래적금 페이지 (Phase 1)

**왜 이게 1순위인가**
- 데이터가 이미 `banks.ts`에 verified 등급으로 존재 — 신규 데이터 수집 0.
- 페이지마다 고유값: 그 은행 우대금리 breakdown(급여/카드/전환/출시 %p) + `calc.ts`로 계산한 예상 수령액 + 도약계좌 대비 비교. **변수만 바꾼 thin 페이지가 아니다.**
- 검색 의도 정면 대응: `"[은행명] 청년미래적금 금리"`, `"[은행명] 미래적금 우대조건"`, `"미래적금 은행별 비교"`.
- **템플릿이 이미 있다:** `SchemeDetail`/`ProgramDetail`이 정확히 이 패턴(엔티티 데이터 → 상세+SEO head → prerender). 재사용, 신규 아키텍처 불필요.

**키워드 패턴 (14개 은행 × 수식어)**
- head: `미래적금 은행별 비교`, `청년미래적금 금리 비교` → 허브(`/youth-savings/banks`)
- long-tail: `IBK 청년미래적금 우대조건`, `카카오뱅크 미래적금 금리`, `농협 미래적금 계산` … → 스포크 14장

## 3. Page Template Spec

**URL:** `/youth-savings/banks/:id` (subfolder, `banks.ts`의 `id` 재사용: ibk, kb, nh, …)
**허브:** `/youth-savings/banks` — 14개 은행 우대금리 비교 표 + 각 스포크 링크

**Title:** `{name} 청년미래적금 금리·우대조건 총정리 | choicewise`
**Meta:** `{name} 청년미래적금 최고 {maxRate}% — 급여/카드/전환 우대 {n}개 조건과 예상 수령액을 계산기로 확인.`

**콘텐츠 블록 (고유값 규칙)**
1. H1 = 은행명 + 미래적금 최고금리(계산값)
2. **우대금리 breakdown 표** — `salaryPref/cardPref/switchPref/launchBonus` + 각 `*Cond` 원문 (은행마다 다름 = 고유)
3. **예상 수령액** — `calc.ts` 신규가입 경로 산출(월납입 대표값 시나리오)
4. **도약계좌 보유자라면** — 갈아타기 경로 비교 표 링크 → 계산기(`/youth-savings`) 딥링크
5. `grade` 신뢰도 배지 + 출처(은행연합회, 최종제공일) — E-E-A-T
6. **관련 은행 3장** 내부 링크(같은 grp 우선) + 허브 breadcrumb

**Schema:** `FinancialProduct` + `BreadcrumbList` (schema-markup 스킬 연계)

**thin 방지 규칙:** 우대조건 원문(`*Cond`)과 계산 결과가 페이지 본문의 최소 60%. 이 둘이 은행마다 실질적으로 달라야 발행. 조건이 사실상 동일한 은행이 있으면 개별 발행 대신 허브 표에만 노출(noindex).

## 4. 내부 링크 (hub & spoke)
- 허브 `/youth-savings/banks` ← 계산기(`/youth-savings`)·홈 푸터에서 링크
- 스포크 ↔ 스포크: 같은 `grp`(2%p/3%p) 은행끼리 교차
- `ROUTE_SEO`에 14개 추가 → prerender 자동 포함 → sitemap 반영
- orphan 0: 모든 스포크는 허브에서 도달

## 5. Pre-Launch Checklist
- [ ] 각 페이지 고유값(우대 breakdown+계산 결과)이 본문 60%↑
- [ ] title/meta 14장 전부 고유(은행명+최고금리 삽입)
- [ ] H1/H2 구조 + `FinancialProduct`/`BreadcrumbList` schema
- [ ] `[R]`/미확정 수치 없음 — verified 등급만 단정, press는 caveat
- [ ] 허브에서 전 스포크 도달, breadcrumb, 관련 은행 3링크
- [ ] `ROUTE_SEO` 등록 → prerender 정적 HTML 생성 확인(`npm run build`)
- [ ] sitemap에 14 URL, 충돌 noindex 없음
- [ ] **로컬 `npm run dev`에서 렌더·계산·반응성·콘솔 0 검증 후에만 배포** (배포 규율)

## 6. Post-Launch Monitoring
| 지표 | 도구 | 임계/알림 | 주기 |
|---|---|---|---|
| 색인률(14장 중 색인 수) | Search Console | 2주 내 <50%면 조사 | 주 1 |
| 순위 | `/seo-rank-check`(rank-tracking.json) | 신규 은행 키워드 스냅샷 append | 주 1 |
| thin-content 경고 | Search Console | 발생 즉시 | 상시 |
| 유입·전환(계산기 진입) | Vercel Analytics | — | 주 1 |

**주의:** 데이터는 은행 최종제공일 기준. `banks.ts` 갱신 시 페이지 자동 반영(단일 출처) — 정본 신선도가 곧 페이지 신선도.

## Phase 2 (파일럿 성과 확인 후)
- `/transit/cards/compare/:type` — K-패스 체크/신용 카드 집계 비교. rank-tracking이 이미 `"K패스 체크카드 비교"`를 콘텐츠 갭으로 표시. 데이터(`transitCards.ts` 22장) 존재. **개별 카드 페이지 아님 — 비교 표 1~3장.**
