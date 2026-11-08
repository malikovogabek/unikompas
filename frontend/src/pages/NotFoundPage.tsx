import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16">
      <EmptyState
        icon={<Compass className="size-6" strokeWidth={1.75} />}
        title={t('notFound.title')}
        text={t('notFound.text')}
        action={<ButtonLink to="/">{t('notFound.home')}</ButtonLink>}
      />
    </div>
  )
}
