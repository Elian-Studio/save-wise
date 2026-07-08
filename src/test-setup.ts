// jsdom은 scrollTo를 미구현이라 호출 시 "Not implemented" 경고를 찍는다.
// 실제 스크롤은 테스트 대상이 아니므로 no-op으로 stub. (node 환경 파일에는 window 없음 → 가드)
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
