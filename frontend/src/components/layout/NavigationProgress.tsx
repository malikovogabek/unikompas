import { useTranslation } from 'react-i18next'
import { useNavigation } from 'react-router'

/** Thin top bar while a route chunk/data is loading, so slow navigations give feedback. */
export function NavigationProgress() {
  const { t } = useTranslation()
  const loading = useNavigation().state === 'loading'
  if (!loading) {
    return null
  }
  return (
    <div role="progressbar" aria-label={t('common.loading')} className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary-soft">
      <div className="h-full w-1/3 animate-[nav-progress_1s_ease-in-out_infinite] bg-primary" />
    </div>
  )
}
