import { GitCompareArrows } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { formatPercent, formatScore, formatSum } from '@/lib/format'
import { cn } from '@/lib/cn'
import { COMPARE_MAX, useCompareStore } from '@/store/compareStore'
import type { RecommendedProgram } from '@/types/api'
import { CategoryBadge } from '@/components/domain/CategoryBadge'
import { ChanceBar } from '@/components/domain/ChanceBar'
import { FavoriteButton } from '@/components/domain/FavoriteButton'
import { MatchRing } from '@/components/domain/MatchRing'
import { ReasonList } from '@/components/domain/ReasonList'
import { UniversityMonogram } from '@/components/domain/UniversityMonogram'

type RecommendedProgramCardProps = { item: RecommendedProgram }

export function RecommendedProgramCard({ item }: RecommendedProgramCardProps) {
  const { t } = useTranslation()
  const compare = useCompareStore()
  const inCompare = compare.ids.includes(item.programId)
  const compareFull = !inCompare && compare.ids.length >= COMPARE_MAX
  const s = item.scores
  const criteria = [
    ['interest', s.interest],
    ['chance', s.chance],
    ['preference', s.preference],
    ['rating', s.rating],
  ] as const

  return (
    <article className="rounded-lg border border-line bg-surface p-5 shadow-card">
      <div className="flex gap-4">
        <MatchRing percent={Math.round(s.total * 100)} label={t('recommendations.match')} size={76} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} />
            <Badge>{t(`studyLanguage.${item.language}`)}</Badge>
            <Badge>{t(`studyForm.${item.studyForm}`)}</Badge>
          </div>
          <Link to={`/programs/${item.programId}`} className="mt-2 block font-display text-[17px] leading-snug font-bold text-text hover:text-primary">
            {item.direction.name}
          </Link>
          <Link to={`/universities/${item.university.id}`} className="mt-0.5 flex items-center gap-2 text-sm text-muted hover:text-primary">
            <UniversityMonogram name={item.university.name} shortName={item.university.shortName} className="size-6 rounded-sm text-[9px]" />
            <span className="truncate">{item.university.name}</span>
          </Link>
        </div>
        <FavoriteButton programId={item.programId} />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <ChanceBar label={t('recommendations.grantChance')} value={s.grantChance} tone="primary" />
          <ChanceBar label={t('recommendations.contractChance')} value={s.contractChance} tone="gold" />
          <dl className="tabular grid grid-cols-2 gap-2 pt-1 text-sm">
            <div>
              <dt className="text-xs text-muted">{t('recommendations.forecast')} · {t('catalog.program.grant')}</dt>
              <dd className="font-semibold">{item.predictedGrantScore != null ? formatScore(item.predictedGrantScore) : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">{t('catalog.program.fee')}</dt>
              <dd className="font-semibold">{formatSum(item.contractFee)}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{t('recommendations.whyTitle')}</h3>
          <div className="mt-2">
            <ReasonList reasons={item.reasons} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label={t('recommendations.breakdown')}>
          {criteria.map(([key, value]) => (
            <div key={key} className="flex gap-1">
              <dt>{t(`recommendations.criteria.${key}`)}</dt>
              <dd className="tabular font-semibold text-text">{formatPercent(value)}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => compare.toggle(item.programId)}
          disabled={compareFull}
          aria-pressed={inCompare}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-sm border px-3 text-sm font-medium transition-colors disabled:opacity-50',
            inCompare ? 'border-primary bg-primary-soft text-primary' : 'border-line text-text hover:bg-surface-2',
          )}
        >
          <GitCompareArrows className="size-4" aria-hidden="true" />
          {inCompare ? t('recommendations.inCompare') : t('recommendations.addCompare')}
        </button>
      </div>
    </article>
  )
}
