// Vendored from @flowmvp/sdk 0.1.0 (User-tracking 모노레포의 @flowmvp/shared).
// choice-wise는 Vercel 단독 배포라 워크스페이스 패키지를 설치할 수 없어 소스를 vendor함.
// 업데이트 시 원본 packages/shared/src/{constants,types} 와 동기화.

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30분
export const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
export const SCROLL_THROTTLE_MS = 3000; // 3초

export const STORAGE_KEYS = {
  SESSION_ID: 'flowmvp_session_id',
  SESSION_LAST_ACTIVE: 'flowmvp_session_last_active',
} as const;

export const API_PATHS = {
  SESSIONS_START: '/api/sessions/start',
  SESSIONS_END: '/api/sessions/end',
  EVENTS: '/api/events',
} as const;

export type EventType = 'page_view' | 'scroll' | 'exit';

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface AnalyticsEvent {
  serviceKey: string;
  sessionId: string;
  userId?: string;
  type: EventType;
  path: string;
  referrer?: string;
  scrollPercent?: number;
  utm?: UtmParams;
  timestamp: string;
}

export interface SessionStartPayload {
  serviceKey: string;
  sessionId: string;
  userId?: string;
  referrer?: string;
  userAgent: string;
}

export interface SessionEndPayload {
  serviceKey: string;
  sessionId: string;
}
