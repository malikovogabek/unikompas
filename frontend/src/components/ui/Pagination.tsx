import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

type PaginationProps = { page: number; totalPages: number; onChange: (page: number) => void }

/** Zero-based page navigation; hidden when everything fits on one page. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) {
    return null
  }
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label={t('common.page', { page: page + 1, total: totalPages })}>
      <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)} icon={<ChevronLeft className="size-4" />}>
        {t('common.prev')}
      </Button>
      <span className="tabular text-sm text-muted">{t('common.page', { page: page + 1, total: totalPages })}</span>
      <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        {t('common.next')}
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}
