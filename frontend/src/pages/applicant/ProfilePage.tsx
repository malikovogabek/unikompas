import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Calculator } from 'lucide-react'
import { useForm, useWatch, type FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { applicantKeys, fetchProfile, saveProfile } from '@/api/applicant'
import { FieldIcon } from '@/components/domain/FieldIcon'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { TextField } from '@/components/ui/TextField'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useFields, useRegions, useSubjects } from '@/hooks/useReference'
import { useRefLabel } from '@/hooks/useRefLabel'
import { cn } from '@/lib/cn'
import type { Profile } from '@/types/api'
import { profileSchema, type ProfileForm } from './profileSchema'

function toForm(p: Profile, scoreParam: string | null): ProfileForm {
  return {
    regionId: p.region ? String(p.region.id) : '',
    firstSubjectId: p.firstSubject ? String(p.firstSubject.id) : '',
    secondSubjectId: p.secondSubject ? String(p.secondSubject.id) : '',
    expectedScore: scoreParam ?? (p.expectedScore != null ? String(p.expectedScore) : ''),
    preferredLanguage: p.preferredLanguage ?? '',
    preferredStudyForm: p.preferredStudyForm ?? '',
    financing: p.financing,
    maxContractFee: p.maxContractFee != null ? String(p.maxContractFee) : '',
    willingToRelocate: p.willingToRelocate,
    fieldIds: p.fields.map((f) => String(f.id)),
  }
}

/**
 * The form is mounted only after the profile AND the option lists are loaded: native
 * selects rendered before their <option>s exist fall back to the first option, which would
 * silently wipe the saved region/subjects on the next save.
 */
export function ProfilePage() {
  const profile = useQuery({ queryKey: applicantKeys.profile, queryFn: fetchProfile })
  const regions = useRegions()
  const subjects = useSubjects()
  const fields = useFields()
  const { t } = useTranslation()
  const apiError = useApiErrorMessage()
  const queries = [profile, regions, subjects, fields]
  const failed = queries.find((q) => q.isError)

  if (failed) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert tone="error">{apiError.message(failed.error)}</Alert>
        <Button variant="secondary" size="sm" onClick={() => queries.forEach((q) => q.isError && void q.refetch())}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }
  if (!profile.data || !regions.isSuccess || !subjects.isSuccess || !fields.isSuccess) {
    return <Skeleton className="h-96 rounded-lg" />
  }
  return <ProfileFormView profile={profile.data} />
}

function ProfileFormView({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const refLabel = useRefLabel()
  const apiError = useApiErrorMessage()
  const [params] = useSearchParams()
  const scoreParam = params.get('score')
  const regions = useRegions()
  const subjects = useSubjects()
  const fields = useFields()

  const { register, handleSubmit, formState, control, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: toForm(profile, scoreParam),
  })
  const financing = useWatch({ control, name: 'financing' })
  const chosenFields = useWatch({ control, name: 'fieldIds' })

  const mutation = useMutation({
    mutationFn: (v: ProfileForm) =>
      saveProfile({
        regionId: Number(v.regionId),
        firstSubjectId: Number(v.firstSubjectId),
        secondSubjectId: Number(v.secondSubjectId),
        expectedScore: Number(v.expectedScore.replace(',', '.')),
        preferredLanguage: v.preferredLanguage || null,
        preferredStudyForm: v.preferredStudyForm || null,
        financing: v.financing,
        maxContractFee: v.financing === 'CONTRACT_OK' && v.maxContractFee ? Number(v.maxContractFee.replace(/\s/g, '')) : null,
        willingToRelocate: v.willingToRelocate,
        fieldIds: v.fieldIds.map(Number),
      }),
    onSuccess: (saved) => {
      qc.setQueryData(applicantKeys.profile, saved)
      reset(toForm(saved, null))
    },
  })
  // Server field errors belong to the last submit; once the user edits, client errors take over.
  const server = mutation.isError && !formState.isDirty ? apiError.fields(mutation.error) : {}
  const err = (name: keyof ProfileForm) => {
    const e = formState.errors[name] as FieldError | undefined
    return e?.message ? t(e.message as 'validation.required') : server[name]
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{t('profile.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('profile.lead')}</p>

      <form className="mt-8 flex flex-col gap-6" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v), () => mutation.reset())}>
        {scoreParam && !mutation.isSuccess && <Alert tone="info">{t('profile.scoreFromCalc')}</Alert>}

        <Card>
          <h2 className="text-lg font-bold">{t('profile.sectionExam')}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Select label={t('profile.region')} error={err('regionId')} {...register('regionId')}>
              <option value="">—</option>
              {regions.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {refLabel('regions', r)}
                </option>
              ))}
            </Select>
            <div className="flex flex-col gap-1.5">
              <TextField label={t('profile.expectedScore')} inputMode="decimal" error={err('expectedScore')} {...register('expectedScore')} />
              <Link to="/calculator" className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline">
                <Calculator className="size-4" aria-hidden="true" />
                {t('profile.calcLink')}
              </Link>
            </div>
            <Select label={t('profile.subject1')} error={err('firstSubjectId')} {...register('firstSubjectId')}>
              <option value="">—</option>
              {subjects.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {refLabel('subjects', s)}
                </option>
              ))}
            </Select>
            <Select label={t('profile.subject2')} error={err('secondSubjectId')} {...register('secondSubjectId')}>
              <option value="">—</option>
              {subjects.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {refLabel('subjects', s)}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">{t('profile.sectionPrefs')}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Select label={t('profile.language')} {...register('preferredLanguage')}>
              <option value="">{t('common.any')}</option>
              {(['UZ', 'RU', 'EN'] as const).map((l) => (
                <option key={l} value={l}>
                  {t(`studyLanguage.${l}`)}
                </option>
              ))}
            </Select>
            <Select label={t('profile.form')} {...register('preferredStudyForm')}>
              <option value="">{t('common.any')}</option>
              {(['FULL_TIME', 'PART_TIME', 'EVENING', 'DISTANCE'] as const).map((f) => (
                <option key={f} value={f}>
                  {t(`studyForm.${f}`)}
                </option>
              ))}
            </Select>
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t('profile.financing')}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['GRANT_ONLY', 'CONTRACT_OK'] as const).map((f) => (
                  <label
                    key={f}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-medium has-focus-visible:shadow-[var(--uk-focus)]',
                      financing === f ? 'border-primary bg-primary-soft text-primary' : 'border-line',
                    )}
                  >
                    <input type="radio" value={f} className="sr-only" {...register('financing')} />
                    {t(`profile.${f}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            {financing === 'CONTRACT_OK' && (
              <TextField
                label={t('profile.maxFee')}
                hint={t('profile.maxFeeHint')}
                inputMode="numeric"
                error={err('maxContractFee')}
                {...register('maxContractFee')}
              />
            )}
            <label className="flex items-center gap-3 self-end py-2 text-sm font-medium md:col-span-2">
              <input type="checkbox" className="size-5 accent-[var(--uk-primary)]" {...register('willingToRelocate')} />
              {t('profile.relocate')}
            </label>
          </div>
        </Card>

        <Card>
          <fieldset>
            <legend className="text-lg font-bold">{t('profile.sectionInterests')}</legend>
            <p className="mt-1 text-sm text-muted">{t('profile.fieldsHint')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {fields.data?.map((f) => {
                const checked = chosenFields.includes(String(f.id))
                const disabled = !checked && chosenFields.length >= 5
                return (
                  <label
                    key={f.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium has-focus-visible:shadow-[var(--uk-focus)]',
                      checked ? 'border-primary bg-primary-soft text-primary' : 'border-line text-text',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <input type="checkbox" value={String(f.id)} disabled={disabled} className="sr-only" {...register('fieldIds')} />
                    <FieldIcon name={f.icon} className="size-4" />
                    {refLabel('fields', f)}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </Card>

        {mutation.isError && <Alert tone="error">{apiError.message(mutation.error)}</Alert>}
        {mutation.isSuccess && !formState.isDirty && (
          <Alert tone="success">
            <span className="flex flex-wrap items-center gap-3">
              {t('profile.saved')}
              <ButtonLink to="/test" size="sm" icon={<ArrowRight className="size-4" />}>
                {t('profile.next')}
              </ButtonLink>
            </span>
          </Alert>
        )}
        <Button type="submit" size="lg" loading={mutation.isPending} className="self-start">
          {t('common.save')}
        </Button>
      </form>
    </div>
  )
}
