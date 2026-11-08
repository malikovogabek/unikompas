import { useQuery } from '@tanstack/react-query'
import { Calculator, RotateCw } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { calculateScore } from '@/api/programs'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatScore } from '@/lib/format'

const MAX = 30

/**
 * Public score calculator (FR-3). The backend formula — including block maximums — is the
 * single source of truth; nothing here duplicates the coefficients.
 */
export function CalculatorPage() {
  const { t } = useTranslation()
  const err = useApiErrorMessage()
  const [answers, setAnswers] = useState({ mandatoryCorrect: 24, firstSubjectCorrect: 24, secondSubjectCorrect: 24 })
  const debounced = useDebouncedValue(answers, 150)
  const result = useQuery({
    queryKey: ['score', debounced],
    queryFn: () => calculateScore(debounced),
    placeholderData: (prev) => prev,
    staleTime: Infinity,
  })
  // Never show numbers that belong to other inputs: hide the result while it is in error.
  const r = result.isError ? undefined : result.data

  const blocks = [
    { key: 'mandatoryCorrect', label: t('calculator.mandatory'), hint: t('calculator.mandatoryHint'), score: r?.mandatoryScore, max: r?.mandatoryMax },
    { key: 'firstSubjectCorrect', label: t('calculator.first'), hint: t('calculator.firstHint'), score: r?.firstSubjectScore, max: r?.firstSubjectMax },
    { key: 'secondSubjectCorrect', label: t('calculator.second'), hint: t('calculator.secondHint'), score: r?.secondSubjectScore, max: r?.secondSubjectMax },
  ] as const

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <PageHeader eyebrow={<Calculator className="size-5" aria-hidden="true" />} title={t('calculator.title')} lead={t('calculator.lead')} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="flex flex-col gap-8">
          {blocks.map((b) => (
            <ScoreSlider
              key={b.key}
              label={b.label}
              hint={b.hint}
              value={answers[b.key]}
              onChange={(v) => setAnswers((a) => ({ ...a, [b.key]: v }))}
              score={b.score}
              maxScore={b.max}
            />
          ))}
        </Card>

        <Card className="girih h-fit text-center lg:sticky lg:top-24">
          <p className="text-sm font-medium text-muted">{t('calculator.total')}</p>
          <p className="tabular mt-2 font-display text-6xl font-extrabold text-primary" aria-live="polite">
            {r ? formatScore(r.total) : '—'}
          </p>
          {r && <p className="mt-1 text-sm text-muted">{t('calculator.of', { max: formatScore(r.maxTotal) })}</p>}
          {result.isError && (
            <div className="mt-4 flex flex-col items-center gap-3 text-left">
              <Alert tone="error">{err.message(result.error)}</Alert>
              <Button variant="secondary" size="sm" icon={<RotateCw className="size-4" />} onClick={() => void result.refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          )}
          <p className="mt-6 text-left text-xs text-muted">{t('calculator.note')}</p>
        </Card>
      </div>
    </div>
  )
}

type ScoreSliderProps = {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  score: number | undefined
  maxScore: number | undefined
}

function ScoreSlider({ label, hint, value, onChange, score, maxScore }: ScoreSliderProps) {
  const { t } = useTranslation()
  const id = useId()
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-semibold text-text">
          {label}
        </label>
        <span className="tabular text-sm text-muted">
          <strong className="text-text">{score !== undefined ? formatScore(score) : '—'}</strong>
          {maxScore !== undefined && ` / ${formatScore(maxScore)}`}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-muted">{hint}</p>
      <div className="mt-3 flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={0}
          max={MAX}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer accent-[var(--uk-primary)]"
          aria-valuetext={`${value} / ${MAX}`}
        />
        <input
          type="number"
          min={0}
          max={MAX}
          value={value}
          aria-label={`${label}: ${t('calculator.correct')}`}
          onChange={(e) => onChange(Math.max(0, Math.min(MAX, Number(e.target.value) || 0)))}
          className="tabular h-10 w-16 rounded-sm border border-line bg-surface text-center font-semibold text-text"
        />
      </div>
    </div>
  )
}
