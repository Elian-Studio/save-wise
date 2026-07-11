---
name: seo-rank-check
description: >
  choicewise.kr 타깃 키워드의 네이버·구글 검색 순위를 재측정해 docs/seo/rank-tracking.json에
  새 snapshot을 append하고, 직전 스냅샷과의 변화를 표로 보고한다. 사용자가 "/seo-rank-check",
  "순위 점검/확인해보자", "SEO 순위 어떻게 됐어", "검색 노출 확인" 이라고 하면 사용한다.
  키워드 추가/삭제 요청도 이 스킬로 처리한다(keywords 배열 수정 후 측정).
---

# SEO 순위 점검 (choicewise.kr)

`docs/seo/rank-tracking.json`이 단일 진실원이다. **method를 임의로 바꾸지 마라** — 시계열 비교가
목적이므로 측정 방법이 흔들리면 전체 데이터가 무효가 된다. method 변경이 필요하면 사용자 승인 후
`method` 필드에 변경 이력을 남긴다.

## 절차

1. **진실원 로드**: `docs/seo/rank-tracking.json`을 Read. `method`, `keywords[]`, 마지막 snapshot을 파악한다.
   같은 날짜의 스냅샷이 이미 있으면 사용자에게 덮어쓸지 물어본다(기본: 중단).

2. **도구 로드**: ToolSearch 한 번으로 로드 —
   `select:mcp__claude_ai_PlayMCP__NaverSearch-search_webkr,WebSearch`
   - PlayMCP(네이버)가 없는 환경(헤드리스/스케줄 실행)이면 측정 불가 — 중단하고 사용자에게
     대화형 세션에서 실행하라고 알린다. 구글만 측정한 반쪽 스냅샷을 남기지 마라.

3. **측정** (keywords[] 순회, 독립 호출은 병렬로):
   - **네이버**: `search_webkr`, `display=30` (브랜드 키워드 '패스와이즈'·'choicewise'는 10).
     rank = 결과 items에서 `choicewise.kr` 링크가 나오는 1-base 순번, 없으면 null.
     top3 도메인과 특이사항(신규 경쟁자, 스니펫의 구 title 잔존 여부)을 note에 기록.
   - **구글**: `WebSearch`(미국 리전, 근사치). 베이스라인에서 google을 측정한 키워드만 측정하고
     `queryUsed`를 그대로 재사용한다(예: '교통카드 추천'은 '교통카드 추천 2026',
     choicewise는 'site:choicewise.kr'). rank 산정은 반환 링크 순번 기준.

4. **snapshot append**: 오늘 날짜(YYYY-MM-DD), context(직전 스냅샷 이후 머지된 SEO 관련 PR —
   `git log --oneline`으로 확인), results를 기존 스냅샷과 동일한 스키마로 작성해
   `snapshots` 배열 끝에 추가한다. **기존 스냅샷은 절대 수정하지 않는다.**
   저장 후 `python3 -m json.tool docs/seo/rank-tracking.json > /dev/null`로 검증.

5. **보고**: 직전 스냅샷 대비 변화표를 출력한다.
   - 형식: 키워드 | 네이버 이전→현재 (▲n/▼n/—/NEW/OUT) | 구글 이전→현재
   - 순위 외 신호도 요약: 인덱스 페이지 수 변화, 스니펫 갱신 여부(구 '패스픽'/'총정리' 캐시 소멸),
     신규 경쟁 진입.
   - 판단 주의: 스냅샷 간격이 2주 미만이면 "추세 판단은 이르다"를 명시한다.

6. **커밋**: 변경된 rank-tracking.json은 main에 직접 커밋하지 않는다.
   사용자 확인 후 `docs/seo-rank-<YYYYMMDD>` 브랜치 → 커밋 → push → PR. 사용자가 커밋을 원치
   않으면 워킹트리에 남겨둔다.

## 주의

- 네이버는 웹문서 API 랭킹이며 통합검색 SERP와 다르다. 구글은 미국 리전 근사치다.
  둘 다 **절대 순위가 아니라 추이 비교용** — 보고에 이 한계를 한 줄 명시한다.
- 검색 API 호출이 실패한 키워드는 rank를 지어내지 말고 해당 항목에 `"error"` note를 남긴다.
- 측정 주기 권장 주 1회. 스케줄 자동화는 PlayMCP 인증이 헤드리스에서 빠질 수 있어 비권장.
