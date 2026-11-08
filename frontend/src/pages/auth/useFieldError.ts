import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LIMITS } from './authSchemas'

/** Translates a react-hook-form error whose message is an i18n key. */
export function useFieldError() {
  const { t } = useTranslation()
  return (field: string, error?: FieldError, serverError?: string): string | undefined => {
    if (serverError) {
      return serverError
    }
    if (!error?.message) {
      return undefined
    }
    const limits = LIMITS[field] ?? {}
    const count = error.message === 'validation.minLength' ? limits.min : limits.max
    return t(error.message as 'validation.required', { count })
  }
}
