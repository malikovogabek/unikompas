import { useTranslation } from 'react-i18next'
import { useRefLabel } from '@/hooks/useRefLabel'
import type { RefItem } from '@/types/api'

/** "① Matematika · ② Fizika" — the ordered exam subject pair. */
export function SubjectPair({ first, second }: { first: RefItem; second: RefItem }) {
  const { t } = useTranslation()
  const refLabel = useRefLabel()
  return (
    <div className="flex flex-wrap gap-1.5 text-xs font-medium" aria-label={t('catalog.directions.subjects')}>
      {[first, second].map((s, i) => (
        <span key={s.id} className="inline-flex items-center gap-1.5 rounded-sm border border-line px-2 py-1 text-text">
          <span className="tabular flex size-4 items-center justify-center rounded-full bg-lapis-900 text-[10px] text-white dark:bg-primary dark:text-on-primary">
            {i + 1}
          </span>
          {refLabel('subjects', s)}
        </span>
      ))}
    </div>
  )
}
