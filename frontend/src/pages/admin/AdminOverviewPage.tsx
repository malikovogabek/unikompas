import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminKeys, fetchStats } from '@/api/admin'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRefLabel } from '@/hooks/useRefLabel'
import { formatInteger } from '@/lib/format'
import { RankedBars } from './RankedBars'

export function AdminOverviewPage() {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const query = useQuery({ queryKey: adminKeys.stats, queryFn: fetchStats })

  return (
    <div>
      <PageHeader title={t('admin.title')} lead={t('admin.lead')} />
      <div className="mt-8">
        <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(s) => {
            const tiles = [
              { label: t('admin.stats.applicants'), value: s.applicants },
              { label: t('admin.stats.completeProfiles'), value: s.completeProfiles },
              { label: t('admin.stats.withTest'), value: s.applicantsWithTest },
              { label: t('admin.stats.recommendations'), value: s.recommendations },
            ]
            return (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {tiles.map((tile) => (
                    <Card key={tile.label} className="p-5">
                      <p className="text-sm text-muted">{tile.label}</p>
                      <p className="tabular mt-1 font-display text-3xl font-extrabold text-text">{formatInteger(tile.value)}</p>
                    </Card>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted">
                  {t('admin.stats.catalog')}:{' '}
                  <strong className="tabular text-text">{formatInteger(s.catalog.universities)}</strong> {t('admin.stats.universities')} ·{' '}
                  <strong className="tabular text-text">{formatInteger(s.catalog.directions)}</strong> {t('admin.stats.directions')} ·{' '}
                  <strong className="tabular text-text">{formatInteger(s.catalog.programs)}</strong> {t('admin.stats.programs')}
                </p>
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                  <Card>
                    <h2 className="font-bold">{t('admin.stats.topDirections')}</h2>
                    <p className="mb-4 text-xs text-muted">{t('admin.stats.top10Hint')}</p>
                    <RankedBars items={s.topDirections.map((d) => ({ key: d.id, label: d.name, value: d.count }))} emptyText={t('admin.stats.noData')} valueLabel={t('admin.stats.recommendations')} />
                  </Card>
                  <Card>
                    <h2 className="font-bold">{t('admin.stats.topUniversities')}</h2>
                    <p className="mb-4 text-xs text-muted">{t('admin.stats.top10Hint')}</p>
                    <RankedBars items={s.topUniversities.map((u) => ({ key: u.id, label: u.code ?? u.name, value: u.count }))} emptyText={t('admin.stats.noData')} valueLabel={t('admin.stats.recommendations')} />
                  </Card>
                  <Card>
                    <h2 className="mb-4 font-bold">{t('admin.stats.byRegion')}</h2>
                    <RankedBars
                      items={s.applicantsByRegion.map((r) => ({ key: r.id, label: refLabel('regions', { id: r.id, code: r.code ?? '', name: r.name }), value: r.count }))}
                      emptyText={t('admin.stats.noData')}
                      valueLabel={t('admin.stats.applicants')}
                    />
                  </Card>
                </div>
              </>
            )
          }}
        </QueryState>
      </div>
    </div>
  )
}
