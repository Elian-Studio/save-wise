import type { ReactNode } from 'react';

// 위저드 공용 프리미티브 — 슬라이더/세그먼트/토글카드/스텝뱃지.
// 디자인은 Switch Advisor(Claude Design) 차용, 토큰은 기존 브랜드(navy/fin-green) 유지.

export function StepBadge({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink">
      {children}
    </div>
  );
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  'aria-label': string;
}) {
  return (
    <input
      type="range"
      className="range flex-1"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(+e.target.value)}
    />
  );
}

export interface SegOption<T> {
  label: ReactNode;
  value: T;
  tag?: string;
}

// 세그먼트 버튼 그룹 — 단일 선택. 터치 44px, 활성 강조.
export function Segments<T extends string | number>({
  options,
  value,
  onChange,
  cols,
  'aria-label': ariaLabel,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  cols?: 1 | 2;
  'aria-label': string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={cols === 1 ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-[13.5px] font-semibold transition ${
              cols === 1 ? 'w-full' : ''
            } ${active ? 'border-primary bg-accent text-ink' : 'border-line bg-card text-ink hover:bg-secondary'}`}
          >
            <span>{o.label}</span>
            {o.tag && (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {o.tag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// 우대조건 토글 카드 — on/off + 난이도/효과 표시.
export function ToggleCard({
  on,
  onToggle,
  icon,
  label,
  desc,
  right,
}: {
  on: boolean;
  onToggle: () => void;
  icon: string;
  label: string;
  desc: string;
  right?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={`flex flex-col rounded-2xl border p-5 text-left transition ${
        on ? 'border-primary bg-accent shadow-sm' : 'border-line bg-card hover:bg-secondary'
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
            on ? 'bg-card' : 'bg-secondary'
          }`}
        >
          {icon}
        </div>
        <div className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-primary' : 'bg-line'}`} aria-hidden>
          <div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
            style={{ left: on ? '22px' : '2px' }}
          />
        </div>
      </div>
      <div className="text-[15px] font-bold text-ink">{label}</div>
      <div className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{desc}</div>
      {right && <div className="mt-3">{right}</div>}
    </button>
  );
}
