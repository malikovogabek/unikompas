import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { isNetworkError, toApiError } from '@/api/client'

/** Maps any thrown value to a localized message: backend code → errors.<CODE>. */
export function errorMessage(t: TFunction, err: unknown): string {
  if (isNetworkError(err)) {
    return t('errors.NETWORK')
  }
  const apiError = toApiError(err)
  const key = `errors.${apiError?.error ?? 'UNKNOWN'}`
  return t(key as 'errors.UNKNOWN', { defaultValue: t('errors.UNKNOWN') })
}

/** Field-level backend errors translated via validation.<constraint>. */
export function fieldErrors(t: TFunction, err: unknown): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [field, code] of Object.entries(toApiError(err)?.fieldErrors ?? {})) {
    result[field] = t(`validation.${code}` as 'validation.Invalid', { defaultValue: t('validation.Invalid') })
  }
  return result
}

export function useApiErrorMessage() {
  const { t } = useTranslation()
  return {
    message: (err: unknown) => errorMessage(t, err),
    fields: (err: unknown) => fieldErrors(t, err),
  }
}
