import { useTranslation } from 'react-i18next'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/cn'

/** Probability 0..1 as a labelled bar; null = this financing is not an option. */
type ChanceBarProps = { label: string; value: number | null; tone: 'primary' | 'gold' }

export function ChanceBar({ label, value, tone }: ChanceBarProps) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="tabular font-semibold text-text">{value === null ? t('recommendations.notOption') : formatPercent(value)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        {value !== null && (
          <div className={cn('h-full rounded-full', tone === 'primary' ? 'bg-primary' : 'bg-gold')} style={{ width: `${Math.round(value * 100)}%` }} />
        )}
      </div>
    </div>
  )
}
