# 변경 이력 (Changelog)

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/),
버전은 [유의적 버전(SemVer)](https://semver.org/lang/ko/)을 따릅니다.

배포: https://save-wise-kadd.vercel.app

## [1.2.0] — 2026-06-24

### Changed

- **은행금리 모델 재설계** ([#6]) — 14개 기관 항목별 우대 %p·충족조건을 은행연합회 소비자포털 비교공시 정본으로
  재수집(전 기관 신뢰등급 `verified`). `bankRate`를 갈아타기 전용에 맞게 재구성 — **도약 연계가입·출시 우대를 전원
  자동가산**한 뒤 급여이체·카드·공통우대를 합산하고 기관 상한으로 캡. 기존 ‘주거래=기관상한’ 근사를 항목별 실제
  합산으로 정교화(예: NH농협 8.0% → 7.5%). 은행 데이터에 `salaryCond`/`switchCond`·`marketingReq`·`grade` 추가.

## [1.1.0] — 2026-06-24

### Added

- **추천 근거 비교표** ([#3]) — 유지 vs 전환 결론을 6개 판단 요인의 가중 점수로 분해해 표/카드로 노출.
- **추천 은행 + 선정 기준** ([#3]) — 전환 시 어떤 은행을 무슨 기준으로 골랐는지(적용금리 구성·우대 근거·순위) 명시.
- **은행 랭킹 상위 5개 + 전체 보기 토글** ([#4]).
- **광고 수익화 스캐폴드** ([#3], [#4]) — 애드센스/애드핏, 환경변수 기반 **기본 OFF**, `ads.txt`·개인정보처리방침 포함.
- **모바일 카드 레이아웃** ([#5]) — 좁은 화면에서 데이터 표를 카드로 전환.

### Changed

- **UI 전면 전환** ([#3]) — Tailwind CSS v4 + shadcn/ui(Radix)로 재구축(금융 디자인 토큰 유지).
- 빌드 툴체인 최신화 — Vite 8 / Vitest 4 / TypeScript 6 / ESLint 10, **Node 24 LTS**.

### Fixed

- 한글이 단어 중간에서 줄바꿈되던 문제 — `word-break: keep-all` ([#5]).

## [1.0.0] — 2026-06-24

### Added

- **최초 공개 배포** ([#1]) — 단일 HTML 프로토타입을 React 19 + TypeScript + Vite 정적 SPA로 재구성, Vercel 배포.
- 유지 vs 전환 순이익·실효수익률 비교, 거래현황 기반 최적 은행 추천, 소득구간·경과기간·유형별 시나리오 표.
- ‘적금 vs 투자’ break-even 비교, 전환 은행 수동 선택, 갈아타기 절차·순서 안내.
- 계산 엔진 순수 함수 분리 + Vitest 단위 테스트.

### Fixed

- number 입력에서 선행 0이 지워지지 않던 문제(`04000` → `4000`) ([#2]).

[1.2.0]: https://github.com/Elian-Studio/save-wise/releases/tag/v1.2.0
[1.1.0]: https://github.com/Elian-Studio/save-wise/releases/tag/v1.1.0
[1.0.0]: https://github.com/Elian-Studio/save-wise/releases/tag/v1.0.0
[#1]: https://github.com/Elian-Studio/save-wise/pull/1
[#2]: https://github.com/Elian-Studio/save-wise/pull/2
[#3]: https://github.com/Elian-Studio/save-wise/pull/3
[#4]: https://github.com/Elian-Studio/save-wise/pull/4
[#5]: https://github.com/Elian-Studio/save-wise/pull/5
[#6]: https://github.com/Elian-Studio/save-wise/pull/6
