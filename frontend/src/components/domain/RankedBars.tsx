import { formatInteger } from '@/lib/format'

type RankedBarsProps = { items: { key: string | number; label: string; value: number }[]; emptyText: string; valueLabel: string }

/**
 * Horizontal ranked bars: one hue (primary), value labelled at the end, no legend needed.
 * Bars are scaled to the largest value in the list.
 */
export function RankedBars({ items, emptyText, valueLabel }: RankedBarsProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{emptyText}</p>
  }
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-text">{item.label}</span>
            <span className="tabular shrink-0 font-semibold text-text" aria-label={`${valueLabel}: ${item.value}`}>
              {formatInteger(item.value)}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-2" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
