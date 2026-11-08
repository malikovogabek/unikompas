import { GitCompareArrows, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useCompareStore } from '@/store/compareStore'

/** Sticky bar shown while 1+ programmes are selected for comparison. */
export function CompareTray() {
  const { t } = useTranslation()
  const ids = useCompareStore((s) => s.ids)
  const clear = useCompareStore((s) => s.clear)
  if (ids.length === 0) {
    return null
  }
  return (
    <div className="sticky bottom-4 z-30 mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-lg border border-line bg-surface p-3 pl-5 shadow-raised" role="status">
      <GitCompareArrows className="size-5 text-primary" aria-hidden="true" />
      <span className="text-sm font-medium">{t('recommendations.compareTray', { count: ids.length })}</span>
      <button type="button" onClick={clear} aria-label={t('common.resetFilters')} className="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface-2">
        <X className="size-4" />
      </button>
      <ButtonLink to={`/compare?ids=${ids.join(',')}`} size="sm" className={ids.length < 2 ? 'pointer-events-none opacity-50' : undefined} aria-disabled={ids.length < 2}>
        {t('recommendations.compareGo')}
      </ButtonLink>
    </div>
  )
}
