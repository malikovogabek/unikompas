import { BedDouble, MapPin, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { useRefLabel } from '@/hooks/useRefLabel'
import { formatInteger } from '@/lib/format'
import type { University } from '@/types/api'
import { UniversityMonogram } from './UniversityMonogram'

export function UniversityCard({ university: u }: { university: University }) {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  return (
    <Link
      to={`/universities/${u.id}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-raised"
    >
      <div className="flex items-start gap-4">
        <UniversityMonogram name={u.name} shortName={u.shortName} />
        <div className="min-w-0">
          <h2 className="font-display text-[17px] leading-snug font-bold text-text group-hover:text-primary">{u.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {u.city ? `${u.city}, ` : ''}
            {refLabel('regions', u.region)}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <Badge tone={u.type === 'STATE' ? 'primary' : 'neutral'}>{t(`universityType.${u.type}`)}</Badge>
        {u.hasDormitory && (
          <Badge icon={<BedDouble className="size-3.5" aria-hidden="true" />}>{t('catalog.universities.dormitory')}</Badge>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-text" title={t('catalog.universities.rating')}>
          <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
          <span className="tabular">{formatInteger(u.rating)}</span>
          <span className="sr-only">{t('catalog.universities.rating')}</span>
        </span>
      </div>
    </Link>
  )
}
