import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { createDirection, fetchDirectionForEdit, updateDirection } from '@/api/admin'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useFields, useSubjects } from '@/hooks/useReference'
import { useRefLabel } from '@/hooks/useRefLabel'
import type { DirectionDetails } from '@/types/api'
import { useAdminFieldError } from './useAdminForm'

const RIASEC = ['r', 'i', 'a', 's', 'e', 'c'] as const
const level = z.string().refine((v) => /^\d{1,2}$/.test(v) && Number(v) <= 10, 'validation.Max')
const schema = z
  .object({
    code: z.string().trim().regex(/^\d{6,12}$/, 'validation.Pattern'),
    name: z.string().trim().min(1, 'validation.required').max(200, 'validation.maxLength'),
    fieldId: z.string().min(1, 'validation.required'),
    firstSubjectId: z.string().min(1, 'validation.required'),
    secondSubjectId: z.string().min(1, 'validation.required'),
    r: level, i: level, a: level, s: level, e: level, c: level,
    description: z.string().max(5000, 'validation.maxLength'),
    careerProspects: z.string().max(5000, 'validation.maxLength'),
  })
  .refine((v) => v.firstSubjectId !== v.secondSubjectId, { path: ['secondSubjectId'], message: 'validation.DistinctSubjects' })
type Form = z.infer<typeof schema>

function toForm(d?: DirectionDetails): Form {
  const rs = d?.riasec ?? { r: 0, i: 0, a: 0, s: 0, e: 0, c: 0 }
  return {
    code: d?.code ?? '',
    name: d?.name ?? '',
    fieldId: d ? String(d.field.id) : '',
    firstSubjectId: d ? String(d.firstSubject.id) : '',
    secondSubjectId: d ? String(d.secondSubject.id) : '',
    r: String(rs.r), i: String(rs.i), a: String(rs.a), s: String(rs.s), e: String(rs.e), c: String(rs.c),
    description: d?.description ?? '',
    careerProspects: d?.careerProspects ?? '',
  }
}

type Props = { id: number | 'new'; onClose: () => void }

export function DirectionFormDialog({ id, onClose }: Props) {
  const { t } = useTranslation()
  const fields = useFields()
  const subjects = useSubjects()
  const existing = useQuery({ queryKey: ['admin', 'direction', id], queryFn: () => fetchDirectionForEdit(id as number), enabled: id !== 'new' })
  const ready = fields.isSuccess && subjects.isSuccess && (id === 'new' || existing.isSuccess)
  return (
    <Modal open title={id === 'new' ? t('admin.form.createTitle') : t('admin.form.editTitle')} onClose={onClose} wide>
      {ready ? <DirectionForm id={id} initial={toForm(existing.data)} onClose={onClose} /> : <Skeleton className="h-80" />}
    </Modal>
  )
}

function DirectionForm({ id, initial, onClose }: { id: number | 'new'; initial: Form; onClose: () => void }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const refLabel = useRefLabel()
  const fields = useFields()
  const subjects = useSubjects()
  const api = useApiErrorMessage()
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: initial })
  const save = useMutation({
    mutationFn: (v: Form) => {
      const body = {
        code: v.code,
        name: v.name,
        fieldId: Number(v.fieldId),
        firstSubjectId: Number(v.firstSubjectId),
        secondSubjectId: Number(v.secondSubjectId),
        riasec: { r: Number(v.r), i: Number(v.i), a: Number(v.a), s: Number(v.s), e: Number(v.e), c: Number(v.c) },
        description: v.description,
        careerProspects: v.careerProspects,
      }
      return id === 'new' ? createDirection(body) : updateDirection(id, body)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin'] })
      void qc.invalidateQueries({ queryKey: ['directions'] })
      void qc.invalidateQueries({ queryKey: ['direction'] })
      onClose()
    },
  })
  const err = useAdminFieldError(formState.errors, save.error)
  const subjectOptions = subjects.data?.map((s) => (
    <option key={s.id} value={s.id}>
      {refLabel('subjects', s)}
    </option>
  ))

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 md:grid-cols-2">
      {save.isError && <Alert tone="error" className="md:col-span-2">{api.message(save.error)}</Alert>}
      <TextField label={t('admin.table.code')} inputMode="numeric" error={err('code')} {...register('code')} />
      <Select label={t('admin.table.field')} error={err('fieldId')} {...register('fieldId')}>
        <option value="">—</option>
        {fields.data?.map((f) => (
          <option key={f.id} value={f.id}>
            {refLabel('fields', f)}
          </option>
        ))}
      </Select>
      <TextField label={t('admin.table.name')} className="md:col-span-2" error={err('name')} {...register('name')} />
      <Select label={t('catalog.directions.subject1')} error={err('firstSubjectId')} {...register('firstSubjectId')}>
        <option value="">—</option>
        {subjectOptions}
      </Select>
      <Select label={t('catalog.directions.subject2')} error={err('secondSubjectId')} {...register('secondSubjectId')}>
        <option value="">—</option>
        {subjectOptions}
      </Select>
      <fieldset className="md:col-span-2">
        <legend className="text-sm font-medium">{t('admin.form.riasec')}</legend>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {RIASEC.map((k) => (
            <TextField key={k} label={t(`riasec.${k.toUpperCase() as 'R'}.name`)} inputMode="numeric" error={err(k)} {...register(k)} />
          ))}
        </div>
      </fieldset>
      <TextArea label={t('admin.form.description')} className="md:col-span-2" error={err('description')} {...register('description')} />
      <TextArea label={t('admin.form.careers')} className="md:col-span-2" error={err('careerProspects')} {...register('careerProspects')} />
      <div className="flex justify-end gap-2 md:col-span-2">
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={save.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  )
}
