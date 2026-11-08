import { useQuery } from '@tanstack/react-query'
import { GitCompareArrows, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { applicantKeys, fetchCompare } from '@/api/applicant'
import { toApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { UniversityMonogram } from '@/components/domain/UniversityMonogram'
import { EmptyState } from '@/components/ui/EmptyState'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRefLabel } from '@/hooks/useRefLabel'
import { formatInteger, formatScore, formatSum } from '@/lib/format'
import { COMPARE_MAX, useCompareStore } from '@/store/compareStore'
import type { Program } from '@/types/api'

/** Side-by-side comparison (FR-7.2). The URL (?ids=) is the source of truth, so links are shareable. */
export function ComparePage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const storeIds = useCompareStore((s) => s.ids)
  const removeFromStore = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const fromUrl = (params.get('ids') ?? '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0)
  const ids = [...new Set(fromUrl.length > 0 ? fromUrl : storeIds)].slice(0, COMPARE_MAX)
  const query = useQuery({ queryKey: applicantKeys.compare(ids), queryFn: () => fetchCompare(ids), enabled: ids.length >= 2 })

  const remove = (id: number) => {
    removeFromStore(id)
    setParams({ ids: ids.filter((x) => x !== id).join(',') }, { replace: true })
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{t('compare.title')}</h1>
      <p className="mt-2 text-muted">{t('compare.lead')}</p>
      <div className="mt-8">
        {ids.length < 2 ? (
          <EmptyState icon={<GitCompareArrows className="size-6" strokeWidth={1.75} />} title={t('compare.empty')} text={t('compare.emptyText')} />
        ) : (
          // A deleted programme makes the whole request 404; offer a way out instead of a dead retry.
          toApiError(query.error)?.error === 'NOT_FOUND' ? (
            <EmptyState
              icon={<GitCompareArrows className="size-6" strokeWidth={1.75} />}
              title={t('compare.stale')}
              text={t('compare.staleText')}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    clear()
                    setParams({}, { replace: true })
                  }}
                >
                  {t('compare.clear')}
                </Button>
              }
            />
          ) : (
            <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
              {(programs) => <CompareTable programs={programs} onRemove={remove} />}
            </QueryState>
          )
        )}
      </div>
    </div>
  )
}

type CompareTableProps = { programs: Program[]; onRemove: (id: number) => void }

function CompareTable({ programs, onRemove }: CompareTableProps) {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const rows: { label: string; cell: (p: Program) => ReactNode }[] = [
    { label: t('catalog.program.direction'), cell: (p) => <Link to={`/directions/${p.direction.id}`} className="font-semibold hover:text-primary">{p.direction.name}</Link> },
    { label: t('compare.region'), cell: (p) => refLabel('regions', p.university.region) },
    { label: t('compare.rating'), cell: (p) => formatInteger(p.university.rating) },
    { label: t('catalog.program.language'), cell: (p) => t(`studyLanguage.${p.language}`) },
    { label: t('catalog.program.form'), cell: (p) => t(`studyForm.${p.studyForm}`) },
    { label: t('catalog.program.duration'), cell: (p) => t('common.years', { count: p.durationYears }) },
    { label: t('catalog.program.grantQuota'), cell: (p) => formatInteger(p.grantQuota) },
    { label: t('catalog.program.contractQuota'), cell: (p) => formatInteger(p.contractQuota) },
    { label: t('catalog.program.fee'), cell: (p) => formatSum(p.contractFee) },
    {
      label: t('compare.latest'),
      cell: (p) =>
        `${p.latestScores?.grantScore != null ? formatScore(p.latestScores.grantScore) : '—'} / ${
          p.latestScores?.contractScore != null ? formatScore(p.latestScores.contractScore) : '—'
        }`,
    },
  ]
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="w-44 p-4" />
            {programs.map((p) => (
              <th key={p.id} scope="col" className="p-4 text-left align-top font-normal">
                <div className="flex items-start gap-3">
                  <UniversityMonogram name={p.university.name} shortName={p.university.shortName} className="size-10 text-xs" />
                  <Link to={`/programs/${p.id}`} className="min-w-0 flex-1 font-display font-bold text-text hover:text-primary">
                    {p.university.name}
                  </Link>
                  <button type="button" onClick={() => onRemove(p.id)} aria-label={`${t('compare.remove')}: ${p.university.name}`} className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface-2">
                    <X className="size-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-0">
              <th scope="row" className="p-4 text-left text-xs font-medium text-muted">
                {row.label}
              </th>
              {programs.map((p) => (
                <td key={p.id} className="tabular p-4 align-top text-text">
                  {row.cell(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
