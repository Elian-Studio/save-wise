import { API_PATHS } from './shared';
import type { AnalyticsEvent, SessionStartPayload, SessionEndPayload } from './shared';

let serverUrl = '';

export function setServerUrl(url: string): void {
  serverUrl = url.replace(/\/$/, '');
}

export function getServerUrl(): string {
  return serverUrl;
}

// 분석 비콘은 쿠키가 필요 없다. credentials:'omit'로 보내 cross-origin 시
// Access-Control-Allow-Credentials 요구를 피한다. (과거 sendBeacon은 credentials:include를
// 강제해 unload 이벤트(sessions/end·exit)가 CORS로 차단됐음.) keepalive로 unload 중에도 전송 보장.
function post(path: string, body: unknown, keepalive: boolean): void {
  void fetch(`${serverUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive,
    credentials: 'omit',
  }).catch(() => {
    // 분석 전송 실패는 앱에 영향 주지 않도록 무시
  });
}

export function sendEvent(event: AnalyticsEvent): void {
  post(API_PATHS.EVENTS, event, true);
}

// unload 시점 exit 이벤트. keepalive fetch가 sendBeacon을 대체(credentials 제어 가능).
export function sendBeaconEvent(event: AnalyticsEvent): void {
  post(API_PATHS.EVENTS, event, true);
}

export function sendSessionStart(payload: SessionStartPayload): void {
  post(API_PATHS.SESSIONS_START, payload, false);
}

export function sendSessionEnd(payload: SessionEndPayload): void {
  post(API_PATHS.SESSIONS_END, payload, true);
}
