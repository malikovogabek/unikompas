import { useTranslation } from 'react-i18next'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatScore } from '@/lib/format'
import type { ScoreHistoryItem } from '@/types/api'

/** Passing-score history: grant (lapis) and contract (gold) lines. */
export function ScoreTrendChart({ history }: { history: ScoreHistoryItem[] }) {
  const { t } = useTranslation()
  const grant = t('catalog.program.grant')
  const contract = t('catalog.program.contract')
  const data = history.map((h) => ({ year: String(h.year), [grant]: h.grantScore, [contract]: h.contractScore }))
  const hasGrant = history.some((h) => h.grantScore !== null)

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--uk-line)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: 'var(--uk-muted)', fontSize: 13 }} axisLine={{ stroke: 'var(--uk-line)' }} tickLine={false} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: 'var(--uk-muted)', fontSize: 13 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v) => (typeof v === 'number' ? formatScore(v) : '—')}
            contentStyle={{ background: 'var(--uk-surface)', border: '1px solid var(--uk-line)', borderRadius: 12, color: 'var(--uk-text)' }}
          />
          <Legend wrapperStyle={{ fontSize: 13, color: 'var(--uk-muted)' }} />
          {hasGrant && (
            <Line type="monotone" dataKey={grant} stroke="var(--uk-primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls isAnimationActive={false} />
          )}
          <Line type="monotone" dataKey={contract} stroke="var(--uk-gold)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
