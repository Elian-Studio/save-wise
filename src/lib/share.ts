// 결과 공유: 계산 상태(inputs+birth+leapStart)를 URL ?s= 파라미터로 직렬화/복원.
// 크롤러용 동적 OG는 별개(서버리스 필요) — 여기선 링크 복원만 담당한다.
// btoa/atob는 브라우저 전역. 모듈 로드 시점이 아니라 함수 내부에서만 호출 → SSR/프리렌더 안전.
import type { Inputs } from './calc';

export interface ShareState {
  inputs: Inputs;
  birth: string;
  leapStart: string;
}

const PARAM = 's';

// JSON → URL-safe base64. Inputs는 id·숫자·enum + 날짜 문자열뿐이라 전부 ASCII → btoa 안전.
export function encodeShare(state: ShareState): string {
  return btoa(JSON.stringify(state)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShare(raw: string): Partial<ShareState> | null {
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const obj = JSON.parse(atob(b64));
    return obj && typeof obj === 'object' ? (obj as Partial<ShareState>) : null;
  } catch {
    return null; // 손상된 링크는 무시하고 기본값으로
  }
}

/** 현재 상태를 담은 공유 URL (호출 시점 origin 기준 — 클라에서만 호출) */
export function buildShareUrl(state: ShareState): string {
  return `${window.location.origin}/?${PARAM}=${encodeShare(state)}`;
}

/** location.search에서 공유 상태 복원 (없거나 손상 시 null) */
export function readShareFromUrl(search: string): Partial<ShareState> | null {
  const raw = new URLSearchParams(search).get(PARAM);
  return raw ? decodeShare(raw) : null;
}
