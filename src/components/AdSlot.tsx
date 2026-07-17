import { useEffect, useRef, type ReactNode } from 'react';
import { ADS, type AdSlotKey } from '../config/ads';

/** 애드핏 슬롯 — ins 마운트 후 슬롯별로 로더를 append.
 *  // ponytail: React SPA에선 ins가 늦게 마운트돼 전역 1회 로드론 ba.min.js 스캔을 놓침 →
 *     공식 우회법(슬롯마다 ba.min.js append). 슬롯 1~3개라 중복 로드 비용 무시 가능. */
function AdfitSlot({ unitId, width, height }: { unitId: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    host.appendChild(s);
  }, []);
  return (
    <div ref={ref}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unitId}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}

let adsenseLoaderAdded = false;
function ensureAdsenseLoader(client: string) {
  if (adsenseLoaderAdded) return;
  adsenseLoaderAdded = true;
  // index.html에 소유권 확인용 스니펫이 이미 있으면 중복 로드하지 않음
  if (document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
}

function AdsenseSlot({ client, slot }: { client: string; slot: string }) {
  useEffect(() => {
    ensureAdsenseLoader(client);
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // 광고 차단 등으로 push 실패해도 페이지엔 영향 없음
    }
  }, [client]);
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

function Labeled({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">광고</span>
      {children}
    </div>
  );
}

/** 위치별 광고. 애드핏 단위가 있으면 애드핏, 없고 애드센스가 설정됐으면 애드센스, 둘 다 없으면 미노출. */
export function Ad({ slot }: { slot: AdSlotKey }) {
  const unit = ADS.adfit[slot];
  if (unit) {
    return (
      <Labeled>
        <AdfitSlot unitId={unit} width={320} height={100} />
      </Labeled>
    );
  }
  const { client } = ADS.adsense;
  const sid = ADS.adsense[slot];
  if (client && sid) {
    return (
      <Labeled>
        <AdsenseSlot client={client} slot={sid} />
      </Labeled>
    );
  }
  return null;
}
