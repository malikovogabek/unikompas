import { Home, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'

/** A chunk that no longer exists on the server (typical right after a deploy). */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : ''
  return /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(message)
}

/**
 * Router error boundary, rendered inside AppLayout. Distinguishes a stale chunk (reload fixes
 * it) from a real bug (reload would not help, so it also offers the home page), and logs the error.
 */
export function RouteError() {
  const { t } = useTranslation()
  const error = useRouteError()
  const chunk = isChunkLoadError(error)
  const notFound = isRouteErrorResponse(error) && error.status === 404
  console.error('Route error', error)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">{notFound ? t('notFound.title') : chunk ? t('errors.NEW_VERSION') : t('errors.UNKNOWN')}</h1>
      <p className="mt-3 text-muted">{chunk ? t('errors.NEW_VERSION_TEXT') : t('errors.INTERNAL_ERROR')}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button icon={<RotateCw className="size-4" />} onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
        <ButtonLink to="/" variant="secondary" icon={<Home className="size-4" />} reloadDocument>
          {t('notFound.home')}
        </ButtonLink>
      </div>
    </div>
  )
}
