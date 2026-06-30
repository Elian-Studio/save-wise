import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setServerUrl,
  sendEvent,
  sendBeaconEvent,
  sendSessionStart,
  sendSessionEnd,
} from './transport';
import type { AnalyticsEvent } from './shared';

// 회귀 가드: end/exit가 sendBeacon(credentials:include 강제)로 가면 cross-origin CORS에 막힌다.
// 모든 전송이 credentials:'omit' + keepalive fetch여야 한다.
const fetchMock = vi.fn<(url?: string, init?: RequestInit) => Promise<void>>(() => Promise.resolve());

const exitEvent: AnalyticsEvent = {
  serviceKey: 'k',
  sessionId: 's',
  type: 'exit',
  path: '/',
  timestamp: 't',
};

describe('flowmvp transport', () => {
  beforeEach(() => {
    setServerUrl('https://track.example.com');
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sendSessionEnd는 keepalive + credentials:omit fetch로 보낸다 (sendBeacon 아님)', () => {
    sendSessionEnd({ serviceKey: 'k', sessionId: 's' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://track.example.com/api/sessions/end',
      expect.objectContaining({ method: 'POST', keepalive: true, credentials: 'omit' }),
    );
  });

  it('sendBeaconEvent(exit)도 keepalive + credentials:omit fetch', () => {
    sendBeaconEvent(exitEvent);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://track.example.com/api/events',
      expect.objectContaining({ keepalive: true, credentials: 'omit' }),
    );
  });

  it('모든 전송은 credentials를 포함하지 않는다 (쿠키 미전송 → ACAC 불필요)', () => {
    sendEvent(exitEvent);
    sendSessionStart({ serviceKey: 'k', sessionId: 's', userAgent: 'ua' });
    sendSessionEnd({ serviceKey: 'k', sessionId: 's' });
    for (const call of fetchMock.mock.calls) {
      expect((call[1] as RequestInit).credentials).toBe('omit');
    }
  });

  it('navigator.sendBeacon에 의존하지 않는다', () => {
    const beacon = vi.fn();
    vi.stubGlobal('navigator', { sendBeacon: beacon } as unknown as Navigator);
    sendSessionEnd({ serviceKey: 'k', sessionId: 's' });
    sendBeaconEvent(exitEvent);
    expect(beacon).not.toHaveBeenCalled();
  });
});
