# 교통카드 파인더 — 계산 스펙 (transit)

> 정본 데이터·근거: `docs/transit-cards-research.md`. 기준 2026-07. `[R]` = 미확정(공식 확인 필요, 파라미터로 스왑).
> UI 정본: 사용자 제공 Claude Design `교통카드 파인더.dc.html` (proj 60914d4a…). 이 스펙은 그 UI의 계산 로직을 실데이터로 구현.

## 1. 입력 (Inputs)
- `region`: `seoul` | `metro`(경기·인천) | `other`(그 외) — 기후동행 이용가능·지역형 판정.
- `transit`: `bs`(지하철·버스) | `wide`(GTX·신분당·광역) | `bike`(따릉이 포함) — 기후동행 이용가능·플러스형 판정.
- `age`(대상유형): `general` | `youth`(만19~34) | `low`(저소득) | `senior`(만65+) — 정률·기준금액·기후동행 요금 계층.
- `fare`: 월 평균 교통비(원). 슬라이더 2만~15만.
- `cardType`: `credit` | `check` — 카드 추천 필터.

## 2. base scheme — K-패스 "모두의 카드" (2026)
2026-01 K-패스가 모두의카드(정액제 무제한 환급)로 개편. **3방식 중 환급금 최대인 것 자동 적용** [official molit·토스뱅크·현대·BC]:
1. **기본형(정률)**: `fare × rate`. rate = { general 0.20, youth 0.30, senior 0.30, low 0.533 }. 월 15회↑ 조건.
2. **모두의 일반형**: 1회 3천원 미만 수단(지하철·버스) 대상. `max(0, fare − capNormal)` 환급 → 실부담 = `min(fare, capNormal)`.
3. **모두의 플러스형**: 전 수단(광역·GTX 포함). 실부담 = `min(fare, capPlus)`.

→ **K-패스 실부담 = fare − max(정률환급, 일반형환급, 플러스형환급)** = 세 방식 중 실부담 최소.

**기준금액(capNormal/capPlus)** — 수도권, 한시 반값 적용(2026-04~09). 확정: 국토부 대광위 반값표(korea.kr 148962910):
| 계층 | capNormal(일반형) | capPlus(플러스형) |
|---|---|---|
| general | 30,000 | 50,000 |
| youth/senior/2자녀 | 25,000 | 45,000 |
| low(3자녀↑·저소득) | 22,000 | 40,000 |
- 반값종료(2026-10~) 정상값(수도권): general 62,000/100,000 · youth·senior·2자녀 55,000/90,000 · low 45,000/85,000 — 확정이나 엔진은 현재 기간(반값) 단일값만 저장(구조 미구현).
- `[R]` 지방(비수도권) 기준금액은 공식 확정표 미확보(블로그 추정만 존재) → 미저장·미확정. 향후 `KPASS.capBase[region][tier]`로 파라미터화. 근거: `docs/transit-cards-research.md`.

## 3. 대안 — 기후동행카드 (서울 정액)
- 이용가능: `region==='seoul' && transit!=='wide'` (서울 외 하차·GTX·신분당 제외).
- 월 정액(실부담 고정): { general 62000, youth 55000, low 45000 } + 따릉이 포함 시 +3000. `senior` 62000(어르신 전용 할인권종 없음 → 일반요금, 지하철 무임 별도).
- 실부담 = 정액요금(무제한). ~~손익분기 `정액/(1−rate)`~~ → **폐기**(연구 §4): 모두의카드 캡 하에서 정률-only 손익분기는 성립하지 않음. 승자는 실부담 직접 비교로만 판정.

## 4. 추천 로직
- **1차(추천 탭)**: K-패스(모두의카드) 실부담 vs 기후동행 실부담 → 낮은 쪽 winner. (손익분기 메시지 폐기 — §3)
- **2차(카드사별)**: K-패스를 쓸 때, 카드사 **추가혜택**으로 순비용 최소 카드 순위.
  - 카드 추가절감 `add`:
    - `benefit.kind==='pct'`: `add = clip(min(fare × pct, monthlyCap))` (clip=100원 단위 내림). 단 전월실적 `minPrevSpend` 충족 가정(UI 고지).
    - `benefit.kind==='flat'`: `add = fare >= minSpend ? amount : 0`.
  - 순비용 = `K-패스 실부담 − add`. 연회비는 월 환산(`annualFee/12`) 차감해 랭킹(선택). `discontinued` 카드는 랭킹 제외(비교표엔 표기).
  - `cardType` 필터(credit/check)로 목록 분리.
- 정부 환급(정률/기준금액)은 카드 무관 동일 → 카드 랭킹 변수는 `add − 연회비월환산`뿐.

## 5. 데이터 (`src/data/transitCards.ts`)
`TransitCard{ id, issuer, name, type, benefit, minPrevSpend, annualFee, source, grade, discontinued? }` + `TRANSIT_CARDS[]` + `KPASS`(rate·cap·minRides) + `CLIMATE`(정액) + `DATA_AS_OF='2026-07'`. 값·grade는 research 문서 표 그대로. press 항목은 UI에서 grade 노출.

## 6. 고지(UI 필수)
- 기준일 배지: "혜택 기준 2026-07 · 매월 변동 가능".
- "추천은 거주지·연령·전월실적에 따라 달라지며, 카드 추가혜택은 전월실적 충족 가정. 가입 전 각 카드사 공식 확인 필요."
- 기후동행 서울 전용·GTX 제외 각주.

## 7. 검증
- `transitCardRec.test.ts`(TDD): 정률 vs 기준금액 최소 선택, 기후동행 실부담 승자 판정, flat/pct add 계산, discontinued 제외, cardType 필터. 경계값(fare 2만/15만, region별 기후동행 가부).
