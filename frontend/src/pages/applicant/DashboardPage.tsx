import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'

/** Placeholder; the applicant dashboard is built in stage 7. */
export function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      <h1 className="text-3xl font-extrabold">{t('dashboard.welcome', { name: user?.fullName ?? '' })}</h1>
      <p className="mt-2 text-muted">{t('dashboard.lead')}</p>
    </div>
  )
}
