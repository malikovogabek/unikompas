import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { createUniversity, fetchUniversityForEdit, updateUniversity } from '@/api/admin'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextArea } from '@/components/ui/TextArea'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useRegions } from '@/hooks/useReference'
import { useRefLabel } from '@/hooks/useRefLabel'
import type { UniversityDetails, UniversityType } from '@/types/api'
import { useAdminFieldError } from './useAdminForm'

const url = z.string().trim().max(300, 'validation.maxLength').refine((v) => v === '' || /^https?:\/\/\S+$/.test(v), 'validation.Pattern')
const schema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(200, 'validation.maxLength'),
  shortName: z.string().trim().max(40, 'validation.maxLength'),
  regionId: z.string().min(1, 'validation.required'),
  city: z.string().trim().max(80, 'validation.maxLength'),
  address: z.string().trim().max(250, 'validation.maxLength'),
  website: url,
  type: z.enum(['STATE', 'PRIVATE', 'FOREIGN_BRANCH']),
  rating: z.string().refine((v) => /^\d{1,3}$/.test(v) && Number(v) <= 100, 'validation.Max'),
  hasDormitory: z.boolean(),
  foundedYear: z.string().refine((v) => v === '' || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= 2100), 'validation.Invalid'),
  description: z.string().max(5000, 'validation.maxLength'),
  logoUrl: url,
})
type Form = z.infer<typeof schema>

const TYPES: UniversityType[] = ['STATE', 'PRIVATE', 'FOREIGN_BRANCH']

function toForm(u?: UniversityDetails): Form {
  return {
    name: u?.name ?? '',
    shortName: u?.shortName ?? '',
    regionId: u ? String(u.region.id) : '',
    city: u?.city ?? '',
    address: u?.address ?? '',
    website: u?.website ?? '',
    type: u?.type ?? 'STATE',
    rating: String(u?.rating ?? 50),
    hasDormitory: u?.hasDormitory ?? false,
    foundedYear: u?.foundedYear ? String(u.foundedYear) : '',
    description: u?.description ?? '',
    logoUrl: u?.logoUrl ?? '',
  }
}

type Props = { id: number | 'new'; onClose: () => void }

/** Create (id = 'new') or edit a university. The form mounts after the record and regions load. */
export function UniversityFormDialog({ id, onClose }: Props) {
  const { t } = useTranslation()
  const regions = useRegions()
  const existing = useQuery({ queryKey: ['admin', 'university', id], queryFn: () => fetchUniversityForEdit(id as number), enabled: id !== 'new' })
  const ready = regions.isSuccess && (id === 'new' || existing.isSuccess)
  return (
    <Modal open title={id === 'new' ? t('admin.form.createTitle') : t('admin.form.editTitle')} onClose={onClose} wide>
      {ready ? <UniversityForm id={id} initial={toForm(existing.data)} onClose={onClose} /> : <Skeleton className="h-80" />}
    </Modal>
  )
}

function UniversityForm({ id, initial, onClose }: { id: number | 'new'; initial: Form; onClose: () => void }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const refLabel = useRefLabel()
  const regions = useRegions()
  const api = useApiErrorMessage()
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: initial })
  const save = useMutation({
    mutationFn: (v: Form) => {
      const body = { ...v, regionId: Number(v.regionId), rating: Number(v.rating), foundedYear: v.foundedYear ? Number(v.foundedYear) : null }
      return id === 'new' ? createUniversity(body) : updateUniversity(id, body)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin'] })
      void qc.invalidateQueries({ queryKey: ['universities'] })
      void qc.invalidateQueries({ queryKey: ['university'] })
      onClose()
    },
  })
  const err = useAdminFieldError(formState.errors, save.error)

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 md:grid-cols-2">
      {save.isError && <Alert tone="error" className="md:col-span-2">{api.message(save.error)}</Alert>}
      <TextField label={t('admin.table.name')} className="md:col-span-2" error={err('name')} {...register('name')} />
      <TextField label={t('admin.table.shortName')} error={err('shortName')} {...register('shortName')} />
      <Select label={t('admin.table.region')} error={err('regionId')} {...register('regionId')}>
        <option value="">—</option>
        {regions.data?.map((r) => (
          <option key={r.id} value={r.id}>
            {refLabel('regions', r)}
          </option>
        ))}
      </Select>
      <TextField label={t('admin.form.city')} error={err('city')} {...register('city')} />
      <TextField label={t('admin.form.address')} error={err('address')} {...register('address')} />
      <Select label={t('admin.table.type')} {...register('type')}>
        {TYPES.map((ty) => (
          <option key={ty} value={ty}>
            {t(`universityType.${ty}`)}
          </option>
        ))}
      </Select>
      <TextField label={`${t('admin.table.rating')} (0–100)`} inputMode="numeric" error={err('rating')} {...register('rating')} />
      <TextField label={t('admin.form.website')} error={err('website')} {...register('website')} />
      <TextField label={t('admin.form.foundedYear')} inputMode="numeric" error={err('foundedYear')} {...register('foundedYear')} />
      <TextField label={t('admin.form.logoUrl')} className="md:col-span-2" error={err('logoUrl')} {...register('logoUrl')} />
      <TextArea label={t('admin.form.description')} className="md:col-span-2" error={err('description')} {...register('description')} />
      <label className="flex items-center gap-3 text-sm font-medium md:col-span-2">
        <input type="checkbox" className="size-5 accent-[var(--uk-primary)]" {...register('hasDormitory')} />
        {t('admin.form.dormitory')}
      </label>
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
