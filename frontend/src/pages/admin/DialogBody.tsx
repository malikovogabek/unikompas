import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'

type DialogBodyProps = { ready: boolean; error: unknown; onRetry: () => void; children: () => ReactNode }

/** Loading / error-with-retry / content for form dialogs that depend on several queries. */
export function DialogBody({ ready, error, onRetry, children }: DialogBodyProps) {
  const { t } = useTranslation()
  const api = useApiErrorMessage()
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert tone="error">{api.message(error)}</Alert>
        <Button variant="secondary" size="sm" icon={<RotateCw className="size-4" />} onClick={onRetry}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }
  return ready ? <>{children()}</> : <Skeleton className="h-80" />
}
