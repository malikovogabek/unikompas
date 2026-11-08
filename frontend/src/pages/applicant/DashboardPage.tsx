import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, Circle, ClipboardList, Compass, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { applicantKeys, fetchLatestRecommendation, fetchLatestTest, fetchProfile } from '@/api/applicant'
import { MatchRing } from '@/components/domain/MatchRing'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'

export function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const apiError = useApiErrorMessage()
  const profile = useQuery({ queryKey: applicantKeys.profile, queryFn: fetchProfile })
  const test = useQuery({ queryKey: applicantKeys.latestTest, queryFn: fetchLatestTest })
  const rec = useQuery({ queryKey: applicantKeys.latestRecommendation, queryFn: fetchLatestRecommendation })
  const loading = profile.isPending || test.isPending || rec.isPending
  const failed = [profile, test, rec].find((q) => q.isError)

  const steps = [
    { icon: ClipboardList, to: '/profile', done: profile.data?.complete === true, title: t('dashboard.step1'), doneText: t('dashboard.step1Done') },
    { icon: Compass, to: '/test', done: !!test.data, title: t('dashboard.step2'), doneText: t('dashboard.step2Done', { code: test.data?.hollandCode ?? '' }) },
    { icon: Sparkles, to: '/recommendations', done: !!rec.data, title: t('dashboard.step3'), doneText: t('dashboard.step3Done', { count: rec.data?.totalMatches ?? 0 }) },
  ]

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{t('dashboard.welcome', { name: user?.fullName ?? '' })}</h1>
      <p className="mt-2 text-muted">{t('dashboard.lead')}</p>

      {failed ? (
        <div className="mt-8 flex flex-col items-start gap-3">
          <Alert tone="error">{apiError.message(failed.error)}</Alert>
          <Button variant="secondary" size="sm" onClick={() => [profile, test, rec].forEach((q) => q.isError && void q.refetch())}>
            {t('common.retry')}
          </Button>
        </div>
      ) : loading ? (
        <Skeleton className="mt-8 h-40 rounded-lg" />
      ) : (
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Step key={s.to} index={i + 1} {...s} />
          ))}
        </ol>
      )}

      {rec.data && rec.data.topDirections.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">{t('dashboard.topDirections')}</h2>
            <Link to="/recommendations" className="text-sm font-semibold text-primary hover:underline">
              {t('dashboard.seeAll')}
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {rec.data.topDirections.slice(0, 3).map((d) => (
              <Link key={d.direction.id} to={`/programs/${d.bestProgramId}`} className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 shadow-card hover:shadow-raised">
                <MatchRing percent={d.matchPercent} label={t('recommendations.match')} size={64} />
                <span className="font-display leading-snug font-bold">{d.direction.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

type StepProps = { index: number; icon: typeof Compass; to: string; done: boolean; title: string; doneText: string }

function Step({ index, icon: Icon, to, done, title, doneText }: StepProps): ReactNode {
  const { t } = useTranslation()
  return (
    <li className={cn('flex flex-col rounded-lg border bg-surface p-5 shadow-card', done ? 'border-turquoise/40' : 'border-line')}>
      <div className="flex items-center justify-between">
        <span className="inline-flex rounded-md bg-primary-soft p-2.5 text-primary">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        {done ? (
          <CheckCircle2 className="size-6 text-turquoise" aria-hidden="true" />
        ) : (
          <Circle className="size-6 text-line" aria-hidden="true" />
        )}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">{index}</p>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className={cn('mt-1 text-sm', done ? 'text-turquoise' : 'text-muted')}>{done ? doneText : ' '}</p>
      <ButtonLink to={to} variant={done ? 'secondary' : 'primary'} size="sm" className="mt-4 self-start" icon={<ArrowRight className="size-4" />}>
        {done ? t('dashboard.open') : t('dashboard.start')}
      </ButtonLink>
    </li>
  )
}
