import { CheckCircle2, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatInteger, formatScore, formatSum } from '@/lib/format'
import type { Reason } from '@/types/api'

/** Renders backend reason codes in the current language, formatting numeric params (TZ §6.6). */
type ReasonListProps = { reasons: Reason[] }

export function ReasonList({ reasons }: ReasonListProps) {
  const { t } = useTranslation()
  return (
    <ul className="space-y-1.5 text-sm">
      {reasons.map((r) => {
        const warning = r.code === 'RISING_TREND' || r.code === 'BELOW_GRANT'
        const params = {
          ...r.params,
          ...(typeof r.params.diff === 'number' && { diff: formatScore(r.params.diff) }),
          ...(typeof r.params.delta === 'number' && { delta: formatScore(r.params.delta) }),
          ...(typeof r.params.fee === 'number' && { fee: formatSum(r.params.fee) }),
          ...(typeof r.params.rating === 'number' && { rating: formatInteger(r.params.rating) }),
        }
        const Icon = warning ? TrendingUp : CheckCircle2
        return (
          <li key={r.code} className="flex gap-2">
            <Icon className={warning ? 'mt-0.5 size-4 shrink-0 text-terracotta' : 'mt-0.5 size-4 shrink-0 text-turquoise'} aria-hidden="true" />
            <span className="text-text">{t(`reasons.${r.code}` as 'reasons.FIELD_MATCH', { ...params, defaultValue: r.code })}</span>
          </li>
        )
      })}
    </ul>
  )
}
