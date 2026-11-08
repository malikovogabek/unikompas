import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { directionKeys, fetchDirections } from '@/api/directions'
import { DirectionCard } from '@/components/domain/DirectionCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFields, useSubjects } from '@/hooks/useReference'
import { useRefLabel } from '@/hooks/useRefLabel'
import { useSearchParamState } from '@/hooks/useSearchParamState'
import { CardGridSkeleton } from '../CardGridSkeleton'

export function DirectionsPage() {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const params = useSearchParamState()
  const fields = useFields()
  const subjects = useSubjects()

  const [search, setSearch] = useState(params.get('q'))
  const debounced = useDebouncedValue(search)
  const { set } = params
  useEffect(() => set('q', debounced.trim()), [debounced, set])

  const filters = {
    search: params.get('q') || undefined,
    fieldId: params.getNumber('field'),
    subjectId1: params.getNumber('s1'),
    subjectId2: params.getNumber('s2'),
    page: params.getNumber('page') ?? 0,
    size: 12,
  }
  const query = useQuery({
    queryKey: directionKeys.list(filters),
    queryFn: () => fetchDirections(filters),
    placeholderData: keepPreviousData,
  })

  const subjectOptions = subjects.data?.map((s) => (
    <option key={s.id} value={s.id}>
      {refLabel('subjects', s)}
    </option>
  ))

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <PageHeader title={t('catalog.directions.title')} lead={t('catalog.directions.lead')} />

      <div className="mt-8 grid gap-4 rounded-lg border border-line bg-surface p-4 md:grid-cols-2 lg:grid-cols-4">
        <SearchInput value={search} onChange={setSearch} placeholder={t('catalog.directions.searchPlaceholder')} />
        <Select label={t('catalog.directions.field')} value={filters.fieldId ?? ''} onChange={(e) => params.set('field', e.target.value)}>
          <option value="">{t('common.all')}</option>
          {fields.data?.map((f) => (
            <option key={f.id} value={f.id}>
              {refLabel('fields', f)}
            </option>
          ))}
        </Select>
        <Select label={t('catalog.directions.subject1')} value={filters.subjectId1 ?? ''} onChange={(e) => params.set('s1', e.target.value)}>
          <option value="">{t('common.all')}</option>
          {subjectOptions}
        </Select>
        <Select label={t('catalog.directions.subject2')} value={filters.subjectId2 ?? ''} onChange={(e) => params.set('s2', e.target.value)}>
          <option value="">{t('common.all')}</option>
          {subjectOptions}
        </Select>
      </div>

      <section className="mt-6" aria-live="polite">
        <QueryState query={query} skeleton={<CardGridSkeleton />}>
          {(page) =>
            page.content.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="size-6" strokeWidth={1.75} />}
                title={t('catalog.directions.empty')}
                text={t('catalog.directions.emptyText')}
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
                <p className="mb-4 text-sm text-muted">{t('common.results', { count: page.totalElements })}</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {page.content.map((d) => (
                    <DirectionCard key={d.id} direction={d} />
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
