import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { applicantKeys, fetchQuestions, submitTest } from '@/api/applicant'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { currentLanguage } from '@/i18n'
import { cn } from '@/lib/cn'
import type { CareerQuestion } from '@/types/api'

const PER_STEP = 6
const DRAFT_KEY = 'unikompas.testDraft'
const SCALE = [1, 2, 3, 4, 5] as const

type Answers = Record<number, number>

function loadDraft(): Answers {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Answers
  } catch {
    return {}
  }
}

export function CareerTestPage() {
  const query = useQuery({ queryKey: applicantKeys.questions, queryFn: fetchQuestions, staleTime: Infinity })
  return (
    <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
      {(questions) => <TestRunner questions={questions} />}
    </QueryState>
  )
}

function TestRunner({ questions }: { questions: CareerQuestion[] }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const apiError = useApiErrorMessage()
  const lang = currentLanguage()
  const [answers, setAnswers] = useState<Answers>(loadDraft)
  const totalSteps = Math.ceil(questions.length / PER_STEP)
  const firstOpen = Math.floor(questions.findIndex((q) => answers[q.id] === undefined) / PER_STEP)
  const [step, setStep] = useState(firstOpen >= 0 ? firstOpen : totalSteps - 1)

  // Draft survives reloads (FR-4: the test can be resumed).
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
    } catch {
      // Storage unavailable: the test still works, just without resume.
    }
  }, [answers])

  const submit = useMutation({
    mutationFn: () => submitTest(questions.map((q) => ({ questionId: q.id, value: answers[q.id]! }))),
    onSuccess: (result) => {
      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // ignore
      }
      qc.setQueryData(applicantKeys.latestTest, result)
      void navigate('/test/result')
    },
  })

  const visible = questions.slice(step * PER_STEP, (step + 1) * PER_STEP)
  const done = questions.filter((q) => answers[q.id] !== undefined).length
  const stepComplete = visible.every((q) => answers[q.id] !== undefined)
  const isLast = step === totalSteps - 1

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">{t('test.title')}</h1>
      <p className="mt-2 text-muted">{t('test.lead')}</p>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-muted">
          <span>{t('test.step', { step: step + 1, total: totalSteps })}</span>
          <span className="tabular">{t('test.progress', { done, total: questions.length })}</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={done}
          aria-label={t('test.progress', { done, total: questions.length })}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(done / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visible.map((q) => (
          <Card key={q.id} className="p-5">
            <fieldset>
              <legend className="font-medium text-text">
                <span className="tabular mr-2 text-muted">{q.orderNo}.</span>
                {q.text[lang]}
              </legend>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {SCALE.map((v) => {
                  const checked = answers[q.id] === v
                  return (
                    <label
                      key={v}
                      className={cn(
                        'flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-1 py-2.5 text-center text-xs transition-colors has-focus-visible:shadow-[var(--uk-focus)]',
                        checked ? 'border-primary bg-primary-soft text-primary' : 'border-line text-muted hover:bg-surface-2',
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={v}
                        checked={checked}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                        className="sr-only"
                      />
                      <span className={cn('tabular flex size-7 items-center justify-center rounded-full font-display text-sm font-bold', checked ? 'bg-primary text-on-primary' : 'bg-surface-2 text-text')}>
                        {v}
                      </span>
                      <span className="hidden leading-tight sm:block">{t(`test.scale${v}`)}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </Card>
        ))}
      </div>

      {submit.isError && <Alert tone="error" className="mt-6">{apiError.message(submit.error)}</Alert>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft className="size-4" />}>
          {t('common.back')}
        </Button>
        {isLast ? (
          <Button disabled={done < questions.length} loading={submit.isPending} onClick={() => submit.mutate()}>
            {t('test.submit')}
          </Button>
        ) : (
          <Button
            disabled={!stepComplete}
            onClick={() => {
              setStep((s) => s + 1)
              window.scrollTo({ top: 0 })
            }}
          >
            {t('common.next')}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted">{t('test.draft')}</p>
    </div>
  )
}
