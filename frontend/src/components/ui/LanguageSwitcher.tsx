import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, currentLanguage, type Language } from '@/i18n'

/** Switches the UI language without a reload; the choice is persisted by i18next (FR-9.2). */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('language.label')}</span>
      <Languages className="pointer-events-none absolute left-2.5 size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
      <select
        value={currentLanguage()}
        onChange={(e) => void i18n.changeLanguage(e.target.value as Language)}
        className="h-9 cursor-pointer appearance-none rounded-sm border border-line bg-surface pr-3 pl-8 text-sm font-medium text-text hover:bg-surface-2"
      >
        {LANGUAGES.map((lng) => (
          <option key={lng} value={lng}>
            {t(`language.${lng}`)}
          </option>
        ))}
      </select>
    </label>
  )
}
