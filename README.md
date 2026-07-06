# choicewise

"나에게 유리한 선택"을 계산해주는 **금융 결정 계산기 플랫폼** (인터랙티브 웹).

| 서비스 | 경로 | 설명 |
|---|---|---|
| **청년적금 갈아타기** | `/` | 청년도약계좌 유지 vs 청년미래적금 전환을 내 소득·거래은행 기준으로 비교, 최적 은행 추천 |
| **교통카드 추천** | `/transit` | 2026 K-패스 모두의카드 실부담 vs 기후동행카드 비교 + 카드사 추가혜택 TOP5 추천(신청 링크 포함) |

🔗 **배포**: https://choicewise.kr

> ⚠️ 참고용 추정 도구입니다. 투자·금융 자문이 아니며, 가입 전 각 기관 공식 페이지에서 최신값을 재확인하세요.

## 주요 기능 (청년적금 갈아타기)

- **유지 vs 전환 추천** — 6개 판단 요인(정부기여금 유형·3년 순이익·소득구간·금리·잔여기간·목적)의 가중 점수로 결론을 내고, **요인별 비교표**로 “왜 그렇게 추천했는지”를 노출
- **추천 은행 + 선정 기준** — 내 거래현황을 14개 기관 우대규칙에 대입해 적용금리 최고 은행을 추천, 적용금리 구성·우대 근거·순위까지 명시
- **은행 적용금리 랭킹** — 상위 5개 기본 + 전체 14개 토글
- **적금 vs 투자 break-even** — 미래적금의 확정 효과를 이기려면 필요한 연수익률 계산
- **모바일 카드 UI** — 좁은 화면에선 표 대신 카드 레이아웃
- 전환 은행 수동 선택, 갈아타기 절차·순서 안내

## 스택

- **React 19 + TypeScript 6 + Vite 8** 정적 SPA (백엔드 없음)
- **Tailwind CSS v4 + shadcn/ui**(Radix) — `src/components/ui`
- 계산 엔진은 순수 함수 모듈(`src/lib/calc.ts`)로 분리 → **Vitest 4** 단위 테스트
- **Node 24 LTS** (`.nvmrc`), 배포: **Vercel** (정적 빌드)

## 개발

```bash
nvm use              # Node 24 (.nvmrc)
npm install
npm run dev          # 개발 서버
npm run test         # 단위 테스트 (계산 엔진·날짜·투자·App 스모크)
npm run typecheck    # 타입 검사
npm run lint         # ESLint
npm run build        # 타입검사 + 프로덕션 빌드 (dist/)
npm run preview      # 빌드 결과 미리보기
```

## 구조

```
src/
  lib/        calc.ts(계산 엔진·추천) · invest.ts(투자 비교) · dates.ts · num.ts · format.ts · utils.ts (+ *.test.ts)
  data/       banks.ts(14개 기관·항목별 우대 %p) · products.ts(상품 파라미터·기여금 테이블) — 단일 출처
  hooks/      useCalculator.ts
  components/ InputsPanel · VerdictCard · DecisionTable(추천 근거) · BankPick(추천 은행) ·
              ComparePanels · BankRanking · ScenarioTables · InvestmentCompare ·
              StepsGuide · ProductCompare · Sources · Disclaimer · AdSlot
    ui/       shadcn 컴포넌트(button·input·select·checkbox·card·table·badge·tabs·label)
  config/     ads.ts(광고 ID — env 기반)
  index.css   Tailwind + 금융 디자인 토큰
docs/         calc-spec.md(계산 정본) · bank-rates-research.md(은행 우대 정본 카탈로그)
legacy/       최초 단일 HTML 프로토타입(참조)
```

## 데이터 갱신

금리·우대조건·기여금 등 모든 수치는 코드의 **단일 출처**에 있다. 갱신 시 아래 파일만 수정하고 재배포한다.

- `src/data/banks.ts` — 14개 기관 항목별 우대 %p(급여이체·카드·도약연계·출시)·충족조건·신뢰등급(`grade`)
- `src/data/products.ts` — 만기·납입한도·기여금률·도약 기여금 구간·일정·`DATA_AS_OF`·출처 링크

기준일은 `products.ts`의 `DATA_AS_OF`로 관리한다.

## 광고 (선택)

광고는 **환경변수 미설정 시 미노출**(기본 OFF — 외부 스크립트도 로드되지 않음). 송출하려면 Vercel 환경변수를 설정한다.

- 구글 애드센스: `VITE_ADSENSE_CLIENT`(`ca-pub-…`) + `VITE_ADSENSE_SLOT_TOP` / `_MID` / `_FOOT`
- 카카오 애드핏: `VITE_ADFIT_UNIT_TOP` / `_MID` / `_FOOT`

사이트 인증 메타는 `index.html`, 판매자 인증(ads.txt)은 `public/ads.txt`에 있다.

## 변경 이력

릴리즈별 변경 사항은 [CHANGELOG.md](./CHANGELOG.md) 참고.

## 출처

금융위원회(87005/87106/86767/83782), korea.kr 정책브리핑, 은행연합회 소비자포털, 카드고릴라, 서민금융진흥원.
