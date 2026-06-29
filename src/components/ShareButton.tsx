import { useState } from 'react';
import { buildShareUrl, type ShareState } from '../lib/share';
import { Button } from '@/components/ui/button';

// 결과 공유 버튼 — 모바일은 네이티브 공유 시트(카톡 등), 그 외는 링크 복사.
// navigator/window는 onClick(사용자 제스처) 안에서만 접근 → 프리렌더 안전.
export function ShareButton({ state, summary }: { state: ShareState; summary: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = buildShareUrl(state);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'choicewise 계산 결과', text: summary, url });
      } catch {
        // 사용자가 공유 시트를 닫음 → 무시
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${summary}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 링크를 복사하세요', url);
    }
  };

  return (
    <div className="mt-3 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
      <span>내 결과를 친구에게 보내기</span>
      <Button variant="outline" size="sm" onClick={onShare}>
        {copied ? '링크 복사됨 ✓' : '🔗 결과 공유'}
      </Button>
    </div>
  );
}
