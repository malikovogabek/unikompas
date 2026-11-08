import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { replaceScores } from '@/api/admin'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Modal } from '@/components/ui/Modal'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { cn } from '@/lib/cn'
import type { Program } from '@/types/api'

const score = z.string().trim().refine((v) => v === '' || (/^\d{1,3}([.,]\d)?$/.test(v) && Number(v.replace(',', '.')) <= 189), 'validation.DecimalMax')
const schema = z.object({
  rows: z
    .array(z.object({ year: z.string().regex(/^(20\d\d|2100)$/, 'validation.Invalid'), grant: score, contract: score }))
    .refine((rows) => new Set(rows.map((r) => r.year)).size === rows.length, 'validation.Duplicate'),
})
type Form = z.infer<typeof schema>
const toNum = (v: string) => (v.trim() === '' ? null : Number(v.replace(',', '.')))
/** Read once at module load (not during render) — fallback when a programme has no history. */
const THIS_YEAR = new Date().getFullYear()

/** Edits the full passing-score history of a programme (PUT replaces it — TZ FR-8.4). */
type ScoresDialogProps = { program: Program; onClose: () => void }

export function ScoresDialog({ program, onClose }: ScoresDialogProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const api = useApiErrorMessage()
  const { register, control, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      rows: program.scoreHistory.map((s) => ({ year: String(s.year), grant: s.grantScore?.toString() ?? '', contract: s.contractScore?.toString() ?? '' })),
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' })
  const save = useMutation({
    mutationFn: (v: Form) => replaceScores(program.id, v.rows.map((r) => ({ year: Number(r.year), grantScore: toNum(r.grant), contractScore: toNum(r.contract) }))),
    onSuccess: () => {
      void qc.invalidateQueries()
      onClose()
    },
  })
  const rowErr = (i: number, k: 'year' | 'grant' | 'contract') => !!formState.errors.rows?.[i]?.[k]
  const nextYear = Math.max(THIS_YEAR - 1, ...fields.map((f) => Number(f.year) || 0)) + 1

  return (
    <Modal open title={`${t('admin.scores.title')} — ${program.university.shortName ?? program.university.name}`} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <p className="text-sm text-muted">{program.direction.name}</p>
        <p className="mt-1 text-xs text-muted">{t('admin.scores.hint')}</p>
        {save.isError && <Alert tone="error" className="mt-3">{api.message(save.error)}</Alert>}
        {formState.errors.rows?.root?.message && <Alert tone="error" className="mt-3">{t('validation.Duplicate')}</Alert>}
        <div className="mt-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-semibold text-muted">
          <span>{t('admin.scores.year')}</span>
          <span>{t('admin.scores.grant')}</span>
          <span>{t('admin.scores.contract')}</span>
          <span className="sr-only">{t('admin.table.actions')}</span>
        </div>
        <div className="mt-1 flex flex-col gap-2">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
              {(['year', 'grant', 'contract'] as const).map((k) => (
                <input
                  key={k}
                  aria-label={`${t(`admin.scores.${k}`)} #${i + 1}`}
                  aria-invalid={rowErr(i, k) || undefined}
                  inputMode="decimal"
                  className={cn('tabular h-10 rounded-sm border bg-surface px-2 text-text', rowErr(i, k) ? 'border-terracotta' : 'border-line')}
                  {...register(`rows.${i}.${k}`)}
                />
              ))}
              <IconButton label={t('common.delete')} tone="danger" icon={<Trash2 className="size-4" />} onClick={() => remove(i)} />
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-3" icon={<Plus className="size-4" />} onClick={() => append({ year: String(nextYear), grant: '', contract: '' })}>
          {t('admin.scores.addYear')}
        </Button>
        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={save.isPending}>{t('common.save')}</Button>
        </div>
      </form>
    </Modal>
  )
}
