import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { cn } from '@/lib/cn'

const TABS = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/profile', key: 'nav.profile' },
  { to: '/test', key: 'nav.test' },
  { to: '/recommendations', key: 'nav.recommendations' },
  { to: '/favorites', key: 'nav.favorites' },
  { to: '/compare', key: 'nav.compare' },
] as const

/** Applicant cabinet shell: horizontally scrollable section tabs above the page. */
export function ApplicantLayout() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <nav aria-label={t('nav.cabinet')} className="-mx-4 overflow-x-auto px-4">
        <ul className="flex min-w-max gap-1 border-b border-line">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    '-mb-px inline-block border-b-2 px-3 py-2.5 text-[15px] font-medium whitespace-nowrap transition-colors',
                    isActive ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text',
                  )
                }
              >
                {t(tab.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  )
}
