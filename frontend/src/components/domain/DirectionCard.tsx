import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useRefLabel } from '@/hooks/useRefLabel'
import type { Direction } from '@/types/api'
import { FieldIcon } from './FieldIcon'
import { SubjectPair } from './SubjectPair'

export function DirectionCard({ direction: d }: { direction: Direction }) {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  return (
    <Link
      to={`/directions/${d.id}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-raised"
    >
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="rounded-sm bg-primary-soft p-1.5 text-primary">
          <FieldIcon name={d.field.icon} className="size-4" />
        </span>
        {refLabel('fields', d.field)}
        <span className="tabular ml-auto font-mono text-xs" title={t('catalog.directions.code')}>
          {d.code}
        </span>
      </div>
      <h2 className="mt-3 font-display text-[17px] leading-snug font-bold text-text group-hover:text-primary">{d.name}</h2>
      <div className="mt-auto pt-4">
        <SubjectPair first={d.firstSubject} second={d.secondSubject} />
      </div>
    </Link>
  )
}
