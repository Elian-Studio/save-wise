import type { CSSProperties } from 'react';

// 근거 리스트 — 'check'(브랜드색 ✓ 원 + 본문, 카드용) / 'chip'(반투명 칩, 그라디언트 배너 내부용).
export function ReasonList({
  reasons,
  variant,
  accent,
}: {
  reasons: string[];
  variant: 'check' | 'chip';
  accent?: string; // 'check' ✓ 원 배경색
}) {
  if (variant === 'chip') {
    return (
      <ul className="mt-2 grid gap-1.5">
        {reasons.map((r, i) => (
          <li key={i} className="rounded-lg bg-white/15 px-3 py-1.5 text-[13.5px]">
            {r}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {reasons.map((r) => (
        <div key={r} className="flex items-start gap-2.5">
          <span
            className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
            style={{ background: accent } as CSSProperties}
            aria-hidden="true"
          >
            ✓
          </span>
          <span className="text-[15.5px] font-medium leading-relaxed text-foreground/90">{r}</span>
        </div>
      ))}
    </div>
  );
}
