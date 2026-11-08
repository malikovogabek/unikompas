import { useTranslation } from 'react-i18next'

/** Placeholder; the admin panel is built in stage 7. */
export function AdminHomePage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <h1 className="text-3xl font-extrabold">{t('admin.title')}</h1>
      <p className="mt-2 text-muted">{t('admin.lead')}</p>
    </div>
  )
}
