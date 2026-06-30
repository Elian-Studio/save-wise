// 결과 공유: 계산 상태(inputs+leapStart)를 URL ?s= 파라미터로 직렬화/복원.
// birth(생년월일)는 PII라 공유에 싣지 않는다 — age는 표시용일 뿐, 계산은 inputs.elapsed/paidCount로 복원됨.
// 크롤러용 동적 OG는 별개(서버리스 필요) — 여기선 링크 복원만 담당한다.
// btoa/atob는 브라우저 전역. 모듈 로드 시점이 아니라 함수 내부에서만 호출 → SSR/프리렌더 안전.
import type { Inputs } from './calc';
import { LEAP } from '../data/products';

export interface ShareState {
  inputs: Inputs;
  leapStart: string;
}

// 복원 결과: 구버전 링크는 일부 필드가 빠질 수 있어 전부 optional·inputs는 Partial.
// useCalculator가 DEFAULTS 위에 머지하므로 빠진 필드는 안전하게 메워진다.
// (구버전 링크의 birth 필드는 타입에 없어 복원 시 자연 무시됨)
export interface DecodedShare {
  inputs?: Partial<Inputs>;
  leapStart?: string;
}

const PARAM = 's';

// UTF-8 안전 base64. btoa는 latin1(0..255)만 받아 비ASCII에서 throw하므로
// TextEncoder로 UTF-8 바이트 → latin1 문자열로 먼저 변환한다(한국어 텍스트 필드 추가 대비).
function toB64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  return btoa(String.fromCharCode(...bytes));
}
function fromB64(b64: string): string {
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

// 손상·악의적 링크 방어: 숫자 필드만 검증(enum/문자열은 calc의 동등성 비교가 이미 방어).
// 비유한수는 드롭(→ DEFAULTS 머지로 메움), 음수 금액·금리는 0, 경과/납입은 0..만기로 클램프.
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
function sanitizeInputs(input: Partial<Inputs>): Partial<Inputs> {
  const out: Partial<Inputs> = { ...input };
  const nonNeg: Array<keyof Inputs> = ['salary', 'leapMonthly', 'leapRate', 'miraeMonthly', 'investReturn'];
  for (const k of nonNeg) {
    const v = out[k];
    if (typeof v !== 'number') continue;
    if (!Number.isFinite(v)) delete out[k];
    else (out[k] as number) = Math.max(0, v);
  }
  for (const k of ['elapsed', 'paidCount'] as const) {
    const v = out[k];
    if (typeof v !== 'number') continue;
    if (!Number.isFinite(v)) delete out[k];
    else out[k] = clamp(v, 0, LEAP.termMonths);
  }
  return out;
}

// JSON → URL-safe base64.
export function encodeShare(state: ShareState): string {
  return toB64(JSON.stringify(state)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShare(raw: string): DecodedShare | null {
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    const obj = JSON.parse(fromB64(b64));
    if (!obj || typeof obj !== 'object') return null;
    const s = obj as DecodedShare;
    if (s.inputs && typeof s.inputs === 'object') s.inputs = sanitizeInputs(s.inputs);
    return s;
  } catch {
    return null; // 손상된 링크는 무시하고 기본값으로
  }
}

/** 현재 상태를 담은 공유 URL (호출 시점 origin 기준 — 클라에서만 호출) */
export function buildShareUrl(state: ShareState): string {
  return `${window.location.origin}/?${PARAM}=${encodeShare(state)}`;
}

/** location.search에서 공유 상태 복원 (없거나 손상 시 null) */
export function readShareFromUrl(search: string): DecodedShare | null {
  const raw = new URLSearchParams(search).get(PARAM);
  return raw ? decodeShare(raw) : null;
}
