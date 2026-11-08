import { cn } from '@/lib/cn'

type MatchRingProps = { percent: number; label: string; size?: number; className?: string }

/** The app's signature visual: a gold progress ring with the match percentage in the centre. */
export function MatchRing({ percent, label, size = 88, className }: MatchRingProps) {
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }} role="img" aria-label={`${clamped}% ${label}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--uk-gold-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--uk-gold)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
        <span className="tabular font-display text-xl font-extrabold text-text">{clamped}%</span>
        <span className="mt-0.5 text-[10px] font-medium text-muted uppercase">{label}</span>
      </span>
    </div>
  )
}
