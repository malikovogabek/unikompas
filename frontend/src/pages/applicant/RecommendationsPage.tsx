import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, SearchX, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { applicantKeys, fetchLatestRecommendation, fetchProfile, generateRecommendation } from '@/api/applicant'
import { toApiError } from '@/api/client'
import { MatchRing } from '@/components/domain/MatchRing'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { CATEGORY_COUNT_CLASS } from '@/lib/category'
import { cn } from '@/lib/cn'
import { formatDate, formatInteger, formatScore } from '@/lib/format'
import type { Category, Recommendation } from '@/types/api'
import { CompareTray } from './CompareTray'
import { RecommendedProgramCard } from './RecommendedProgramCard'

const CATEGORIES: Category[] = ['SAFE', 'TARGET', 'REACH']

export function RecommendationsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const apiError = useApiErrorMessage()
  const latest = useQuery({ queryKey: applicantKeys.latestRecommendation, queryFn: fetchLatestRecommendation })
  const profile = useQuery({ queryKey: applicantKeys.profile, queryFn: fetchProfile })

  const generate = useMutation({
    mutationFn: generateRecommendation,
    onSuccess: (rec) => {
      qc.setQueryData(applicantKeys.latestRecommendation, rec)
      void qc.invalidateQueries({ queryKey: ['recommendations', 'history'] })
    },
  })
  const incomplete = profile.data?.complete === false || toApiError(generate.error)?.error === 'PROFILE_INCOMPLETE'

  const generateButton = (label: string, variant: 'primary' | 'secondary' = 'primary') => (
    <Button variant={variant} loading={generate.isPending} disabled={incomplete} onClick={() => generate.mutate()} icon={variant === 'primary' ? <Sparkles className="size-4" /> : <RefreshCw className="size-4" />}>
      {label}
    </Button>
  )

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">{t('recommendations.title')}</h1>
          <p className="mt-2 text-muted">
            {t('recommendations.lead')}{' '}
            {latest.data && t('recommendations.generatedAt', { date: formatDate(latest.data.createdAt) })}
          </p>
        </div>
        {latest.data && generateButton(t('recommendations.regenerate'), 'secondary')}
      </div>

      {incomplete && (
        <Alert tone="info" className="mt-6">
          <span className="flex flex-wrap items-center gap-3">
            {t('recommendations.incomplete')}
            <ButtonLink to="/profile" size="sm">
              {t('nav.profile')}
            </ButtonLink>
          </span>
        </Alert>
      )}
      {generate.isError && !incomplete && <Alert tone="error" className="mt-6">{apiError.message(generate.error)}</Alert>}

      <div className="mt-8">
        <QueryState query={latest} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(rec) =>
            !rec ? (
              <EmptyState
                icon={<Sparkles className="size-6" strokeWidth={1.75} />}
                title={t('recommendations.empty')}
                text={t('recommendations.emptyText')}
                action={generateButton(t('recommendations.generate'))}
              />
            ) : rec.totalMatches === 0 ? (
              <EmptyState
                icon={<SearchX className="size-6" strokeWidth={1.75} />}
                title={t('recommendations.noMatches')}
                text={t('recommendations.noMatchesText')}
                action={<ButtonLink to="/profile">{t('nav.profile')}</ButtonLink>}
              />
            ) : (
              <RecommendationView rec={rec} />
            )
          }
        </QueryState>
      </div>
    </div>
  )
}

function RecommendationView({ rec }: { rec: Recommendation }) {
  const { t } = useTranslation()
  const firstNonEmpty = CATEGORIES.find((c) => rec.counts[c] > 0) ?? 'SAFE'
  const [tab, setTab] = useState<Category>(firstNonEmpty)

  return (
    <>
      {!rec.usedCareerTest && (
        <Alert tone="info" className="mb-6">
          <span className="flex flex-wrap items-center gap-3">
            {t('recommendations.coldStart')}
            <Link to="/test" className="font-semibold underline">
              {t('nav.test')}
            </Link>
          </span>
        </Alert>
      )}

      <section>
        <h2 className="text-2xl font-bold">{t('recommendations.topDirections')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rec.topDirections.map((d) => (
            <Link key={d.direction.id} to={`/programs/${d.bestProgramId}`} className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-raised">
              <MatchRing percent={d.matchPercent} label={t('recommendations.match')} size={64} />
              <div className="min-w-0">
                <p className="font-display leading-snug font-bold text-text">{d.direction.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {t('recommendations.interest', { value: d.interestPercent })} · {t('recommendations.programsCount', { count: d.programCount })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl font-bold">{t('recommendations.programs')}</h2>
          <p className="tabular text-sm text-muted">
            {formatScore(rec.expectedScore)} · {rec.hollandCode ?? '—'}
          </p>
        </div>
        <div role="tablist" aria-label={t('recommendations.programs')} className="mt-4 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => {
            const selected = tab === c
            return (
              <button
                key={c}
                role="tab"
                id={`tab-${c}`}
                aria-selected={selected}
                aria-controls={`panel-${c}`}
                onClick={() => setTab(c)}
                className={cn(
                  'rounded-md border p-3 text-left transition-colors',
                  selected ? 'border-primary bg-surface shadow-card' : 'border-line bg-surface-2 hover:bg-surface',
                )}
              >
                <span className="flex items-center justify-between">
                  <span className={cn('font-display font-bold', selected ? 'text-text' : 'text-muted')}>{t(`category.${c}`)}</span>
                  <span className={cn('tabular rounded-sm px-2 py-0.5 text-xs font-bold', CATEGORY_COUNT_CLASS[c])}>{formatInteger(rec.counts[c])}</span>
                </span>
                <span className="mt-0.5 hidden text-xs text-muted sm:block">{t(`category.${c}Hint`)}</span>
              </button>
            )
          })}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-4 flex flex-col gap-4">
          {rec.programs[tab].length === 0 ? (
            <p className="rounded-lg border border-dashed border-line py-10 text-center text-muted">{t('recommendations.noMatches')}</p>
          ) : (
            rec.programs[tab].map((p) => <RecommendedProgramCard key={p.programId} item={p} />)
          )}
        </div>
      </section>
      <CompareTray />
    </>
  )
}
