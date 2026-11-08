import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { createProgram, updateProgram } from '@/api/admin'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import type { Program } from '@/types/api'
import { DialogBody } from './DialogBody'
import { useAdminFieldError } from './useAdminForm'
import { useCatalogOptions } from './useCatalogOptions'

const count = z.string().refine((v) => /^\d{1,7}$/.test(v), 'validation.PositiveOrZero')
const schema = z.object({
  universityId: z.string().min(1, 'validation.required'),
  directionId: z.string().min(1, 'validation.required'),
  language: z.enum(['UZ', 'RU', 'EN']),
  studyForm: z.enum(['FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE']),
  grantQuota: count,
  contractQuota: count,
  contractFee: z.string().refine((v) => /^\d{1,12}$/.test(v), 'validation.PositiveOrZero'),
  durationYears: z.string().refine((v) => /^[1-7]$/.test(v), 'validation.Max'),
})
type Form = z.infer<typeof schema>

function toForm(p?: Program): Form {
  return {
    universityId: p ? String(p.university.id) : '',
    directionId: p ? String(p.direction.id) : '',
    language: p?.language ?? 'UZ',
    studyForm: p?.studyForm ?? 'FULL_TIME',
    grantQuota: String(p?.grantQuota ?? 0),
    contractQuota: String(p?.contractQuota ?? 0),
    contractFee: String(p?.contractFee ?? 0),
    durationYears: String(p?.durationYears ?? 4),
  }
}

type ProgramFormDialogProps = { program: Program | 'new'; onClose: () => void }

export function ProgramFormDialog({ program, onClose }: ProgramFormDialogProps) {
  const { t } = useTranslation()
  const options = useCatalogOptions()
  return (
    <Modal open title={program === 'new' ? t('admin.form.createTitle') : t('admin.form.editTitle')} onClose={onClose} wide>
      <DialogBody ready={options.ready} error={options.error} onRetry={options.retry}>
        {() => <ProgramForm program={program} onClose={onClose} />}
      </DialogBody>
    </Modal>
  )
}

function ProgramForm({ program, onClose }: ProgramFormDialogProps) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const api = useApiErrorMessage()
  const options = useCatalogOptions()
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: toForm(program === 'new' ? undefined : program) })
  const save = useMutation({
    mutationFn: (v: Form) => {
      const body = {
        ...v,
        universityId: Number(v.universityId),
        directionId: Number(v.directionId),
        grantQuota: Number(v.grantQuota),
        contractQuota: Number(v.contractQuota),
        contractFee: Number(v.contractFee),
        durationYears: Number(v.durationYears),
      }
      return program === 'new' ? createProgram(body) : updateProgram(program.id, body)
    },
    onSuccess: () => {
      void qc.invalidateQueries()
      onClose()
    },
  })
  const err = useAdminFieldError(formState.errors, save.error)

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 md:grid-cols-2">
      {save.isError && <Alert tone="error" className="md:col-span-2">{api.message(save.error)}</Alert>}
      <Select label={t('admin.table.university')} className="md:col-span-2" error={err('universityId')} {...register('universityId')}>
        <option value="">—</option>
        {options.universities.map((u) => (
          <option key={u.id} value={u.id}>{u.shortName ? `${u.shortName} — ${u.name}` : u.name}</option>
        ))}
      </Select>
      <Select label={t('admin.table.direction')} className="md:col-span-2" error={err('directionId')} {...register('directionId')}>
        <option value="">—</option>
        {options.directions.map((d) => (
          <option key={d.id} value={d.id}>{`${d.code} — ${d.name}`}</option>
        ))}
      </Select>
      <Select label={t('admin.form.language')} {...register('language')}>
        {(['UZ', 'RU', 'EN'] as const).map((l) => <option key={l} value={l}>{t(`studyLanguage.${l}`)}</option>)}
      </Select>
      <Select label={t('admin.form.studyForm')} error={err('studyForm')} {...register('studyForm')}>
        {(['FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE'] as const).map((f) => <option key={f} value={f}>{t(`studyForm.${f}`)}</option>)}
      </Select>
      <TextField label={t('admin.form.grantQuota')} inputMode="numeric" error={err('grantQuota')} {...register('grantQuota')} />
      <TextField label={t('admin.form.contractQuota')} inputMode="numeric" error={err('contractQuota')} {...register('contractQuota')} />
      <TextField label={t('admin.form.contractFee')} inputMode="numeric" error={err('contractFee')} {...register('contractFee')} />
      <TextField label={t('admin.form.duration')} inputMode="numeric" error={err('durationYears')} {...register('durationYears')} />
      <div className="flex justify-end gap-2 md:col-span-2">
        <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit" loading={save.isPending}>{t('common.save')}</Button>
      </div>
    </form>
  )
}
