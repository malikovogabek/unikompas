import { BarChart3, BookOpen, Building2, FileUp, Layers, SlidersHorizontal, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/cn'

const LINKS = [
  { to: '/admin', end: true, key: 'admin.nav.overview', icon: BarChart3 },
  { to: '/admin/universities', key: 'admin.nav.universities', icon: Building2 },
  { to: '/admin/directions', key: 'admin.nav.directions', icon: BookOpen },
  { to: '/admin/programs', key: 'admin.nav.programs', icon: Layers },
  { to: '/admin/import', key: 'admin.nav.import', icon: FileUp },
  { to: '/admin/settings', key: 'admin.nav.settings', icon: SlidersHorizontal },
  { to: '/admin/users', key: 'admin.nav.users', icon: Users },
] as const

/** Admin shell: sidebar on desktop, horizontally scrollable tabs on mobile. */
export function AdminLayout() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label={t('admin.nav.section')} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <ul className="flex min-w-max gap-1 lg:sticky lg:top-24 lg:min-w-0 lg:flex-col">
          {LINKS.map(({ to, key, icon: Icon, ...rest }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={'end' in rest}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-sm px-3 py-2 text-[15px] font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-2 hover:text-text',
                  )
                }
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
