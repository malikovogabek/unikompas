import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LIMITS } from './authSchemas'

/**
 * Translates a react-hook-form error whose message is an i18n key. The current client-side
 * error wins over a server error from an earlier submit (which may be stale after edits).
 */
export function useFieldError() {
  const { t } = useTranslation()
  return (field: string, error?: FieldError, serverError?: string): string | undefined => {
    if (!error?.message) {
      return serverError
    }
    const limits = LIMITS[field] ?? {}
    const count = error.message === 'validation.minLength' ? limits.min : limits.max
    return t(error.message as 'validation.required', { count })
  }
}
