import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, BedDouble, CalendarDays, ExternalLink, MapPin, Star } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { fetchUniversity, fetchUniversityPrograms, universityKeys } from '@/api/universities'
import { ProgramRow } from '@/components/domain/ProgramRow'
import { UniversityMonogram } from '@/components/domain/UniversityMonogram'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRefLabel } from '@/hooks/useRefLabel'
import { formatInteger } from '@/lib/format'

export function UniversityDetailPage() {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const id = Number(useParams().id)
  // Page is tied to the entity: navigating to another :id starts from page 0.
  const [paging, setPaging] = useState({ id, page: 0 })
  const page = paging.id === id ? paging.page : 0
  const setPage = (next: number) => setPaging({ id, page: next })
  const university = useQuery({ queryKey: universityKeys.detail(id), queryFn: () => fetchUniversity(id) })
  const programs = useQuery({
    queryKey: universityKeys.programs(id, page),
    queryFn: () => fetchUniversityPrograms(id, page),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <Link to="/universities" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('nav.universities')}
      </Link>

      <QueryState query={university} skeleton={<Skeleton className="mt-6 h-48 rounded-lg" />}>
        {(u) => (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex items-start gap-4">
                <UniversityMonogram name={u.name} shortName={u.shortName} className="size-16 text-base" />
                <div>
                  <h1 className="text-3xl leading-tight font-extrabold text-text">{u.name}</h1>
                  <p className="mt-2 flex items-center gap-1 text-muted">
                    <MapPin className="size-4" aria-hidden="true" />
                    {[u.address ?? u.city, refLabel('regions', u.region)].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              {u.description && (
                <section className="mt-6">
                  <h2 className="text-lg font-bold">{t('catalog.universities.about')}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{u.description}</p>
                </section>
              )}
            </div>
            <Card className="h-fit p-5">
              <dl className="space-y-3 text-sm">
                <Fact label={t('catalog.universities.type')}>
                  <Badge tone={u.type === 'STATE' ? 'primary' : 'neutral'}>{t(`universityType.${u.type}`)}</Badge>
                </Fact>
                <Fact label={t('catalog.universities.rating')}>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star className="size-4 fill-gold text-gold" aria-hidden="true" />
                    <span className="tabular">{formatInteger(u.rating)} / 100</span>
                  </span>
                </Fact>
                <Fact label={t('catalog.universities.dormitory')}>
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="size-4 text-muted" aria-hidden="true" />
                    {u.hasDormitory ? t('common.yes') : t('common.no')}
                  </span>
                </Fact>
                {u.foundedYear && (
                  <Fact label={t('catalog.universities.founded')}>
                    <span className="tabular inline-flex items-center gap-1">
                      <CalendarDays className="size-4 text-muted" aria-hidden="true" />
                      {u.foundedYear}
                    </span>
                  </Fact>
                )}
                <Fact label={t('catalog.universities.programs')}>
                  <span className="tabular font-semibold">{formatInteger(u.programCount)}</span>
                </Fact>
              </dl>
              {u.website && (
                <a
                  href={u.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {t('catalog.universities.website')}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              )}
            </Card>
          </div>
        )}
      </QueryState>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">{t('catalog.universities.programs')}</h2>
        <p className="mt-1 text-sm text-muted">{t('common.demoData')}</p>
        <div className="mt-4">
          <QueryState query={programs} skeleton={<Skeleton className="h-64 rounded-lg" />}>
            {(p) => (
              p.content.length === 0 ? (
                <EmptyState icon={<BookOpen className="size-6" strokeWidth={1.75} />} title={t('catalog.program.emptyList')} />
              ) : (
              <>
                <div className="flex flex-col gap-3">
                  {p.content.map((program) => (
                    <ProgramRow key={program.id} program={program} titleFrom="direction" />
                  ))}
                </div>
                <Pagination page={p.page} totalPages={p.totalPages} onChange={setPage} />
              </>
              )
            )}
          </QueryState>
        </div>
      </section>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-text">{children}</dd>
    </div>
  )
}
