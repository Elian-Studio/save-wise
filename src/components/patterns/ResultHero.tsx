import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// 결과·판단 그라디언트 배너 — transit 결과 카드와 youth verdict가 공유하는 표면.
// 콘텐츠는 children 슬롯(중앙형/좌flex형 모두 수용). 그라디언트는 tone(className) 또는 style로 주입.
export function ResultHero({
  tone,
  style,
  deco = false,
  animate = false,
  className,
  children,
}: {
  tone?: string; // tailwind 그라디언트 유틸 (youth: 'bg-gradient-to-br from-navy to-navy2')
  style?: CSSProperties; // 인라인 그라디언트 (transit: { background: 'linear-gradient(...)' })
  deco?: boolean; // 우상단 반투명 원 데코
  animate?: boolean; // 등장 애니메이션
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-7 text-white',
        animate && 'duration-300 animate-in fade-in zoom-in-95 motion-reduce:animate-none',
        tone,
        className,
      )}
      style={style}
    >
      {deco && (
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/10"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
