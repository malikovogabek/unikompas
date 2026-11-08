import { useQuery } from '@tanstack/react-query'
import { Compass, RotateCcw, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { applicantKeys, fetchLatestTest } from '@/api/applicant'
import { RiasecRadar } from '@/components/domain/RiasecRadar'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPercent } from '@/lib/format'

const ORDER = ['r', 'i', 'a', 's', 'e', 'c'] as const

export function TestResultPage() {
  const { t } = useTranslation()
  const query = useQuery({ queryKey: applicantKeys.latestTest, queryFn: fetchLatestTest })
  return (
    <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
      {(result) =>
        !result ? (
          <EmptyState
            icon={<Compass className="size-6" strokeWidth={1.75} />}
            title={t('test.noResult')}
            text={t('test.noResultText')}
            action={<ButtonLink to="/test">{t('dashboard.start')}</ButtonLink>}
          />
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold">{t('test.resultTitle')}</h1>
            <p className="mt-2 text-muted">{t('test.resultLead')}</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card>
                <RiasecRadar profile={result.scores} max={1} label={`${t('riasec.title')}: ${result.hollandCode}`} />
                <dl className="tabular mt-2 grid grid-cols-3 gap-2 text-center text-sm sm:grid-cols-6">
                  {ORDER.map((k) => (
                    <div key={k}>
                      <dt className="text-xs text-muted">{t(`riasec.${k.toUpperCase() as 'R'}.name`)}</dt>
                      <dd className="font-semibold">{formatPercent(result.scores[k])}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
              <Card className="girih">
                <p className="text-sm font-medium text-muted">{t('riasec.hollandCode')}</p>
                <p className="mt-1 font-mono text-5xl font-bold tracking-[0.3em] text-primary">{result.hollandCode}</p>
                <ol className="mt-6 space-y-4">
                  {result.hollandCode.split('').map((code, i) => (
                    <li key={code} className="flex gap-3">
                      <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-lapis-900">{i + 1}</span>
                      <div>
                        <p className="font-bold">{t(`riasec.${code as 'R'}.name`)}</p>
                        <p className="text-sm text-muted">{t(`riasec.${code as 'R'}.desc`)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink to="/recommendations" icon={<Sparkles className="size-4" />}>
                    {t('test.toRecommendations')}
                  </ButtonLink>
                  <ButtonLink to="/test" variant="secondary" icon={<RotateCcw className="size-4" />}>
                    {t('test.retake')}
                  </ButtonLink>
                </div>
              </Card>
            </div>
          </div>
        )
      }
    </QueryState>
  )
}
