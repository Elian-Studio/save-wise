import { initSession, endSession } from './session';
import { setServerUrl } from './transport';
import { initPageViewTracker, trackPageView, setupRouterListener } from './pageview';
import { initScrollTracker, startScrollTracking, stopScrollTracking, resetScrollTracking } from './scroll';
import { initExitTracker, startExitTracking, stopExitTracking } from './exit';

export interface FlowInitOptions {
  serviceKey: string;
  serverUrl: string;
  env?: 'dev' | 'staging' | 'prod';
  userId?: string;
  autoTrackPageView?: boolean;
  autoTrackScroll?: boolean;
  autoTrackExit?: boolean;
}

let initialized = false;

export const Flow = {
  init(options: FlowInitOptions): void {
    if (initialized) return;

    const {
      serviceKey: rawKey,
      serverUrl,
      env,
      userId,
      autoTrackPageView = true,
      autoTrackScroll = true,
      autoTrackExit = true,
    } = options;

    const serviceKey = env && env !== 'prod' ? `${rawKey}-${env}` : rawKey;

    setServerUrl(serverUrl);
    initSession(serviceKey, userId);
    initPageViewTracker(serviceKey);
    initScrollTracker(serviceKey);
    initExitTracker(serviceKey);

    if (autoTrackPageView) trackPageView();
    if (autoTrackScroll) startScrollTracking();
    if (autoTrackExit) startExitTracking();

    initialized = true;
  },

  trackPageView,
  setupRouterListener,

  startScrollTracking,
  stopScrollTracking,
  resetScrollTracking,

  startExitTracking,
  stopExitTracking,

  destroy(): void {
    stopScrollTracking();
    stopExitTracking();
    endSession();
    initialized = false;
  },
};
