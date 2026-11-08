import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

/**
 * Router-level error boundary: an unexpected render error or a failed chunk download
 * (e.g. after a new deploy) shows a friendly message with reload instead of a blank page.
 */
export function RouteError() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16">
      <EmptyState
        title={t('errors.UNKNOWN')}
        action={
          <Button icon={<RotateCw className="size-4" />} onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        }
      />
    </div>
  )
}
