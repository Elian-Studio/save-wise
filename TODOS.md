# TODOS

## Transit (K-패스 교통카드 파인더)

### 반값 종료(2026-10) 기준금액 데이터 교체
**Priority:** P1
정상 기준금액표(수도권: general 62,000/100,000 · youth/senior 55,000/90,000 · low 45,000/85,000)는 `docs/transit-cards-research.md` §1-2에 확보돼 있음. 2026-10 전에 `KPASS` 상수 교체 또는 기간 파라미터화. UI에는 시효 경고 배너(2026-10 이후 자동 노출)가 이미 들어가 있음.

### 비수도권 기준금액 공식표 확보
**Priority:** P1
`region==='other'`는 현재 수도권 반값 기준 추정치 + 캐비앳 노출로 처리 중. korea-pass.kr / 모두의카드.kr에서 지역별(일반 지방권/우대지원/특별지원) 확정표 확보 시 `KPASS.capBase[region][tier]` 구조로 파라미터화. 근거: research §1-3.

### press 등급 카드 공시 재확인
**Priority:** P2
samsung-check(월 한도·실적 미공시), kjbank-green(월 한도 미공시), hana-check(note-데이터 모순으로 press 하향) — 카드사 공시 확인되면 verified 상향 + 값 확정. 근거: research §3-2.

### applyUrl 링크 로트 모니터링
**Priority:** P3
16개 신청 링크 중 채널코드 딥링크(cooperationcode, cardGdsNo)는 로트 위험 높음. 분기별 HEAD 체크 스크립트 또는 수동 점검.

## Platform

### 라우트 코드 스플리팅
**Priority:** P3
`router.tsx`가 두 서비스를 정적 import — 서비스 3개째 추가 시 `React.lazy` + Suspense로 전환 (performance 리뷰 지적, 현재 2라우트 규모에선 의도적 보류).

### StepNav·히어로 패널 공통화
**Priority:** P4
진행 칩 마크업이 Wizard.tsx/Transit.tsx에 중복, fin-green 히어로 패널도 aside/결과에 중복. 위저드가 3개째 생기면 추출 (2곳 중복은 의도적 허용).

### compare() climate 승리 분기 테스트
**Priority:** P4
현행 상수(캡 ≤ 기후동행 정액)로는 `winner==='climate'` 도달 불가라 미검증. 반값 종료 데이터 교체 시(P1) 상수 주입 가능하게 리팩터링 + 승자 뒤집힘 테스트 추가.

## Completed
