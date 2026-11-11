import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/Spinner'
import { useServerStatusStore } from '@/store/serverStatusStore'

/**
 * Shown while any request has been pending for a few seconds — on the free hosting tier this
 * almost always means the backend is starting. Replaces a confusing "no connection" error.
 */
export function WakeBanner() {
  const { t } = useTranslation()
  const slow = useServerStatusStore((s) => s.slowRequests > 0)
  if (!slow) {
    return null
  }
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex max-w-lg items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-raised">
        <Spinner className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-text">{t('server.waking')}</p>
          <p className="mt-0.5 text-sm text-muted">{t('server.wakingText')}</p>
        </div>
      </div>
    </div>
  )
}
