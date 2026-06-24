# save-wise

청년도약계좌 ↔ 청년미래적금 **갈아타기 계산기** (인터랙티브 웹).

내 소득·납입 이력·거래은행을 넣으면 **유지(Stay) vs 전환(Switch)** 의 순이익·실효수익률을 같은 기준으로 비교하고,
**가장 유리한 은행**을 찾아 추천을 근거와 함께 제시한다. ‘적금 vs 투자’ break-even 비교도 제공한다.

> ⚠️ 참고용 추정 도구입니다. 투자·금융 자문이 아니며, 가입 전 은행·서민금융진흥원·은행연합회 포털에서 최신값을 재확인하세요.

## 스택

- **React 19 + TypeScript + Vite 5** 정적 SPA (백엔드 없음)
- 계산 엔진은 순수 함수 모듈(`src/lib/calc.ts`)로 분리 → **Vitest** 단위 테스트
- 배포: **Vercel** (정적 빌드)

## 개발

```bash
npm install
npm run dev          # 개발 서버
npm run test         # 단위 테스트 (계산 엔진)
npm run typecheck    # 타입 검사
npm run lint         # ESLint
npm run build        # 타입검사 + 프로덕션 빌드 (dist/)
npm run preview      # 빌드 결과 미리보기
```

## 구조

```
src/
  lib/        calc.ts(계산 엔진) · invest.ts(투자 비교) · dates.ts · format.ts (+ *.test.ts)
  data/       banks.ts(14개 기관) · products.ts(상품 파라미터·기여금 테이블) — 단일 출처
  hooks/      useCalculator.ts
  components/ 입력·결론·비교·은행랭킹·시나리오·투자비교·절차·출처·면책
docs/         calc-spec.md(계산 정본) · calc-spec-draft.md
legacy/       최초 단일 HTML 프로토타입(참조)
```

## 데이터 갱신

금리·우대조건·기여금 등 모든 수치는 코드의 **단일 출처**에 있다. 갱신 시 아래 파일만 수정하고 재배포한다.

- `src/data/banks.ts` — 참여 은행·기관우대 그룹·카드 우대 %p
- `src/data/products.ts` — 만기·납입한도·기여금률·도약 기여금 구간·일정·`DATA_AS_OF`·출처 링크

기준일은 `products.ts`의 `DATA_AS_OF`로 관리한다.

## 출처

금융위원회(87005/87106/86767/83782), korea.kr 정책브리핑, 은행연합회 소비자포털, 카드고릴라, 서민금융진흥원.
