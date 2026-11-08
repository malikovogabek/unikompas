import { Hammer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'

/** Temporary target for catalog links until stage 6. */
export function ComingSoonPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <EmptyState icon={<Hammer className="size-6" strokeWidth={1.75} />} title={t('common.comingSoon')} />
    </div>
  )
}
