import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm text-muted">{t('footer.tagline')}</p>
          <p className="mt-2 max-w-md text-xs text-muted">{t('footer.disclaimer')}</p>
        </div>
        <div className="text-sm text-muted md:text-right">
          <p>{t('footer.thesis')}</p>
          <a href="https://github.com/malikovogabek/unikompas" className="mt-1 inline-block hover:text-primary">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
