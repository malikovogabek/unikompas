import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Coins, GraduationCap, Languages, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { fetchProgram, programKeys } from '@/api/programs'
import { ScoreTrendChart } from '@/components/domain/ScoreTrendChart'
import { SubjectPair } from '@/components/domain/SubjectPair'
import { UniversityMonogram } from '@/components/domain/UniversityMonogram'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatScore, formatSum } from '@/lib/format'

export function ProgramPage() {
  const { t } = useTranslation()
  const id = Number(useParams().id)
  const query = useQuery({ queryKey: programKeys.detail(id), queryFn: () => fetchProgram(id) })

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
        {(p) => (
          <>
            <Link
              to={`/universities/${p.university.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {p.university.shortName ?? p.university.name}
            </Link>

            <div className="mt-6 flex items-start gap-4">
              <UniversityMonogram name={p.university.name} shortName={p.university.shortName} className="size-14" />
              <div>
                <Link to={`/directions/${p.direction.id}`} className="hover:text-primary">
                  <h1 className="text-3xl leading-tight font-extrabold text-text">{p.direction.name}</h1>
                </Link>
                <Link to={`/universities/${p.university.id}`} className="mt-1 block text-muted hover:text-primary">
                  {p.university.name}
                </Link>
                <div className="mt-3">
                  <SubjectPair first={p.direction.firstSubject} second={p.direction.secondSubject} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Fact icon={<Languages className="size-4" />} label={t('catalog.program.language')} value={t(`studyLanguage.${p.language}`)} />
              <Fact icon={<GraduationCap className="size-4" />} label={t('catalog.program.form')} value={t(`studyForm.${p.studyForm}`)} />
              <Fact icon={<Clock className="size-4" />} label={t('catalog.program.duration')} value={t('common.years', { count: p.durationYears })} />
              <Fact
                icon={<Users className="size-4" />}
                label={`${t('catalog.program.grantQuota')} / ${t('catalog.program.contractQuota')}`}
                value={`${p.grantQuota} / ${p.contractQuota}`}
              />
              <Fact icon={<Coins className="size-4" />} label={t('catalog.program.fee')} value={formatSum(p.contractFee)} />
            </div>

            <Card className="mt-8">
              <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{t('catalog.program.history')}</h2>
                  <p className="text-sm text-muted">{t('catalog.program.historyLead')}</p>
                </div>
                {p.latestScores && (
                  <p className="tabular text-sm text-muted">
                    {t('catalog.program.lastScores', { year: p.latestScores.year })}:{' '}
                    <strong className="text-text">
                      {p.latestScores.grantScore != null ? formatScore(p.latestScores.grantScore) : '—'} /{' '}
                      {p.latestScores.contractScore != null ? formatScore(p.latestScores.contractScore) : '—'}
                    </strong>
                  </p>
                )}
              </div>
              <div className="mt-4">
                {p.scoreHistory.length > 0 ? (
                  <ScoreTrendChart history={p.scoreHistory} />
                ) : (
                  <p className="py-10 text-center text-muted">{t('catalog.program.noHistory')}</p>
                )}
              </div>
            </Card>

            <Alert tone="info" className="mt-6">
              {t('footer.disclaimer')} {t('common.demoData')}
            </Alert>
          </>
        )}
      </QueryState>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="tabular mt-1 font-semibold text-text">{value}</div>
    </div>
  )
}
