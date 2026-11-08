import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, fetchWeights, saveWeights } from '@/api/admin'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { cn } from '@/lib/cn'
import type { Weights } from '@/types/api'

const KEYS = ['interest', 'chance', 'preference', 'rating'] as const
const DEFAULTS: Weights = { interest: 0.35, chance: 0.35, preference: 0.15, rating: 0.15 }

export function AdminSettingsPage() {
  const { t } = useTranslation()
  const query = useQuery({ queryKey: adminKeys.weights, queryFn: fetchWeights })
  return (
    <div>
      <PageHeader title={t('admin.settings.title')} lead={t('admin.settings.lead')} />
      <div className="mt-8">
        <QueryState query={query} skeleton={<Skeleton className="h-72 rounded-lg" />}>
          {(w) => <WeightsForm initial={w} />}
        </QueryState>
      </div>
    </div>
  )
}

function WeightsForm({ initial }: { initial: Weights }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const api = useApiErrorMessage()
  const [values, setValues] = useState(initial)
  const sum = KEYS.reduce((s, k) => s + values[k], 0)
  const valid = Math.abs(sum - 1) <= 0.001 && KEYS.every((k) => values[k] >= 0 && values[k] <= 1)
  const save = useMutation({
    mutationFn: () => saveWeights(values),
    onSuccess: (w) => qc.setQueryData(adminKeys.weights, w),
  })

  return (
    <Card className="max-w-2xl">
      <div className="flex flex-col gap-6">
        {KEYS.map((k, i) => (
          <div key={k}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`w-${k}`} className="font-semibold">
                w{'₁₂₃₄'[i]} · {t(`recommendations.criteria.${k}`)}
              </label>
              <span className="tabular font-mono text-sm">{values[k].toFixed(2)}</span>
            </div>
            <input
              id={`w-${k}`}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={values[k]}
              onChange={(e) => {
                save.reset()
                setValues((v) => ({ ...v, [k]: Number(e.target.value) }))
              }}
              className="mt-2 w-full accent-[var(--uk-primary)]"
            />
          </div>
        ))}
      </div>
      <p className={cn('tabular mt-6 font-semibold', valid ? 'text-turquoise' : 'text-terracotta')} aria-live="polite">
        {t('admin.settings.sum', { value: sum.toFixed(2) })}
        {!valid && ` — ${t('validation.SumToOne')}`}
      </p>
      {save.isError && <Alert tone="error" className="mt-4">{api.message(save.error)}</Alert>}
      {save.isSuccess && <Alert tone="success" className="mt-4">{t('admin.settings.saved')}</Alert>}
      <div className="mt-6 flex gap-2">
        <Button disabled={!valid} loading={save.isPending} onClick={() => save.mutate()}>
          {t('common.save')}
        </Button>
        <Button variant="secondary" onClick={() => { save.reset(); setValues(DEFAULTS) }}>
          {t('admin.settings.reset')}
        </Button>
      </div>
    </Card>
  )
}
