/**
 * Tiny dependency-free trend line (one per program row — Recharts would be too heavy here).
 * Values are drawn left→right; nulls are skipped.
 */
export function Sparkline({ values, className, label }: { values: (number | null)[]; className?: string; label: string }) {
  const points = values.map((v, i) => (v === null ? null : { i, v })).filter((p): p is { i: number; v: number } => p !== null)
  if (points.length < 2) {
    return null
  }
  const w = 64
  const h = 20
  const min = Math.min(...points.map((p) => p.v))
  const max = Math.max(...points.map((p) => p.v))
  const span = max - min || 1
  const x = (i: number) => (i / (values.length - 1)) * (w - 4) + 2
  const y = (v: number) => h - 2 - ((v - min) / span) * (h - 4)
  const d = points.map((p, k) => `${k === 0 ? 'M' : 'L'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]!
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h} role="img" aria-label={label}>
      <path d={d} fill="none" stroke="var(--uk-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last.i)} cy={y(last.v)} r="2.25" fill="var(--uk-primary)" />
    </svg>
  )
}
