import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fetchUniversities, universityKeys } from '@/api/universities'
import { UniversityCard } from '@/components/domain/UniversityCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { useRegions } from '@/hooks/useReference'
import { useRefLabel } from '@/hooks/useRefLabel'
import { useSearchParamState, useUrlSearch } from '@/hooks/useSearchParamState'
import { formatInteger } from '@/lib/format'
import type { UniversityType } from '@/types/api'
import { CardGridSkeleton } from '../CardGridSkeleton'

const TYPES: UniversityType[] = ['STATE', 'PRIVATE', 'FOREIGN_BRANCH']

export function UniversitiesPage() {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const params = useSearchParamState()
  const regions = useRegions()

  // Search is typed locally and pushed to the URL debounced.
  const [search, setSearch] = useUrlSearch(params)

  const filters = {
    search: params.get('q') || undefined,
    regionId: params.getNumber('region'),
    type: (params.get('type') || undefined) as UniversityType | undefined,
    page: params.getNumber('page') ?? 0,
    size: 12,
  }
  const query = useQuery({
    queryKey: universityKeys.list(filters),
    queryFn: () => fetchUniversities(filters),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <PageHeader title={t('catalog.universities.title')} lead={t('catalog.universities.lead')} />

      <div className="mt-8 grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-[2fr_1fr_1fr]">
        <SearchInput value={search} onChange={setSearch} placeholder={t('catalog.universities.searchPlaceholder')} />
        <Select
          label={t('catalog.universities.region')}
          value={filters.regionId ?? ''}
          onChange={(e) => params.set('region', e.target.value)}
        >
          <option value="">{t('common.all')}</option>
          {regions.data?.map((r) => (
            <option key={r.id} value={r.id}>
              {refLabel('regions', r)}
            </option>
          ))}
        </Select>
        <Select label={t('catalog.universities.type')} value={filters.type ?? ''} onChange={(e) => params.set('type', e.target.value)}>
          <option value="">{t('common.all')}</option>
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {t(`universityType.${ty}`)}
            </option>
          ))}
        </Select>
      </div>

      <section className="mt-6" aria-live="polite">
        <QueryState query={query} skeleton={<CardGridSkeleton />}>
          {(page) =>
            page.content.length === 0 ? (
              <EmptyState
                icon={<Building2 className="size-6" strokeWidth={1.75} />}
                title={t('catalog.universities.empty')}
                text={t('catalog.universities.emptyText')}
                action={
                  params.hasAny && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearch('')
                        params.reset()
                      }}
                    >
                      {t('common.resetFilters')}
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-muted">{t('common.results', { count: page.totalElements, value: formatInteger(page.totalElements) })}</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {page.content.map((u) => (
                    <UniversityCard key={u.id} university={u} />
                  ))}
                </div>
                <Pagination page={page.page} totalPages={page.totalPages} onChange={(p) => params.set('page', p)} />
              </>
            )
          }
        </QueryState>
      </section>
    </div>
  )
}
