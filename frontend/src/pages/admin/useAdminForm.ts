import type { FieldError, FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'

/**
 * Error text for an admin form field: the client-side (Zod) message key wins, otherwise the
 * server's constraint code from the last failed mutation.
 */
export function useAdminFieldError(errors: FieldErrors, serverError: unknown) {
  const { t } = useTranslation()
  const api = useApiErrorMessage()
  const server = serverError ? api.fields(serverError) : {}
  return (name: string): string | undefined => {
    const e = errors[name] as FieldError | undefined
    return e?.message ? t(e.message as 'validation.required') : server[name]
  }
}
