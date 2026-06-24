// 컨트롤드 <input type="number">의 '선행 0이 안 지워지는' 문제 해결.
// 원인: "04000" → Number 4000으로 파싱돼 state가 이전과 같으면 React가
//       value prop 변화를 못 느껴 DOM을 갱신하지 않음(no-op) → "04000"이 남음.

/** "04000"→"4000", "0"→"0", "0.5"→"0.5", "04.5"→"4.5", "00.5"→"0.5" */
export function stripLeadingZeros(s: string): string {
  return s.replace(/^0+(?=\d)/, '');
}

/**
 * number 입력 onChange에서 호출. 선행 0을 제거하고, 파싱값이 state와 같아
 * React가 리렌더하지 않는 경우에도 DOM을 직접 교정한 뒤 숫자를 반환한다.
 */
export function readNumberInput(e: { target: HTMLInputElement }): number {
  const fixed = stripLeadingZeros(e.target.value);
  if (fixed !== e.target.value) e.target.value = fixed;
  return Number(fixed) || 0;
}
