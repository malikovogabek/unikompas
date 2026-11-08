import type { UseQueryResult } from '@tanstack/react-query'
import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { Alert } from './Alert'
import { Button } from './Button'

type QueryStateProps<T> = {
  query: UseQueryResult<T>
  skeleton: ReactNode
  children: (data: T) => ReactNode
}

/**
 * Renders the three mandatory states of server data (CLAUDE.md §7.7):
 * loading → skeleton, error → message + retry, success → children.
 * Empty states are handled by the children, which know what "empty" means.
 */
export function QueryState<T>({ query, skeleton, children }: QueryStateProps<T>) {
  const { t } = useTranslation()
  const err = useApiErrorMessage()
  if (query.isPending) {
    return <>{skeleton}</>
  }
  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert tone="error">{err.message(query.error)}</Alert>
        <Button variant="secondary" size="sm" icon={<RotateCw className="size-4" />} onClick={() => void query.refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }
  return <>{children(query.data)}</>
}
