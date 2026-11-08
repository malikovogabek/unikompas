import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

/** Minimal hero; the full landing page (how it works, stats) comes in stage 6. */
export function HomePage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  return (
    <section className="girih border-b border-line">
      <div className="mx-auto max-w-[1200px] px-4 py-20 md:py-28">
        <h1 className="max-w-3xl text-4xl leading-[1.1] font-extrabold text-text md:text-6xl">{t('home.title')}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{t('home.subtitle')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to={isAuthenticated ? '/dashboard' : '/register'} size="lg" icon={<ArrowRight className="size-5" />}>
            {t('home.cta')}
          </ButtonLink>
          <ButtonLink to="/universities" variant="secondary" size="lg">
            {t('home.browse')}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
