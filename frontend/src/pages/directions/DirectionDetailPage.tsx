import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { directionKeys, fetchDirection, fetchDirectionPrograms } from '@/api/directions'
import { FieldIcon } from '@/components/domain/FieldIcon'
import { ProgramRow } from '@/components/domain/ProgramRow'
import { RiasecRadar } from '@/components/domain/RiasecRadar'
import { SubjectPair } from '@/components/domain/SubjectPair'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRefLabel } from '@/hooks/useRefLabel'

export function DirectionDetailPage() {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  const id = Number(useParams().id)
  // Page is tied to the entity: navigating to another :id starts from page 0.
  const [paging, setPaging] = useState({ id, page: 0 })
  const page = paging.id === id ? paging.page : 0
  const setPage = (next: number) => setPaging({ id, page: next })
  const direction = useQuery({ queryKey: directionKeys.detail(id), queryFn: () => fetchDirection(id) })
  const programs = useQuery({
    queryKey: directionKeys.programs(id, page),
    queryFn: () => fetchDirectionPrograms(id, page),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <Link to="/directions" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('nav.directions')}
      </Link>

      <QueryState query={direction} skeleton={<Skeleton className="mt-6 h-72 rounded-lg" />}>
        {(d) => (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="rounded-sm bg-primary-soft p-1.5 text-primary">
                  <FieldIcon name={d.field.icon} className="size-4" />
                </span>
                {refLabel('fields', d.field)}
                <span className="tabular font-mono text-xs">· {d.code}</span>
              </div>
              <h1 className="mt-3 text-3xl leading-tight font-extrabold text-text md:text-4xl">{d.name}</h1>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-muted">{t('catalog.directions.subjects')}</p>
                <SubjectPair first={d.firstSubject} second={d.secondSubject} />
              </div>
              {d.description && (
                <section className="mt-8">
                  <h2 className="text-lg font-bold">{t('catalog.directions.about')}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{d.description}</p>
                </section>
              )}
              {d.careerProspects && (
                <section className="mt-6">
                  <h2 className="text-lg font-bold">{t('catalog.directions.careers')}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{d.careerProspects}</p>
                </section>
              )}
            </div>

            <Card className="p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">{t('riasec.title')}</h2>
                <span className="text-sm text-muted">
                  {t('riasec.hollandCode')}:{' '}
                  <strong className="font-mono text-base tracking-widest text-primary">{d.hollandCode}</strong>
                </span>
              </div>
              <RiasecRadar profile={d.riasec} max={10} label={`${t('riasec.title')}: ${d.hollandCode}`} />
              <ul className="space-y-1.5 text-sm">
                {d.hollandCode.split('').map((code) => (
                  <li key={code}>
                    <strong className="text-text">{t(`riasec.${code as 'R'}.name`)}</strong>
                    <span className="text-muted"> — {t(`riasec.${code as 'R'}.desc`)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </QueryState>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">{t('catalog.directions.offeredBy')}</h2>
        <p className="mt-1 text-sm text-muted">{t('common.demoData')}</p>
        <div className="mt-4">
          <QueryState query={programs} skeleton={<Skeleton className="h-64 rounded-lg" />}>
            {(p) => (
              p.content.length === 0 ? (
                <EmptyState icon={<Building2 className="size-6" strokeWidth={1.75} />} title={t('catalog.program.emptyList')} />
              ) : (
              <>
                <div className="flex flex-col gap-3">
                  {p.content.map((program) => (
                    <ProgramRow key={program.id} program={program} titleFrom="university" />
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
