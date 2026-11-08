import { LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/cn'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

const PUBLIC_LINKS = [
  { to: '/universities', key: 'nav.universities' },
  { to: '/directions', key: 'nav.directions' },
  { to: '/calculator', key: 'nav.calculator' },
] as const

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-sm px-3 py-2 text-[15px] font-medium transition-colors',
    isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-2 hover:text-text',
  )

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const privateLink = user?.role === 'ADMIN' ? { to: '/admin', key: 'nav.admin' as const } : { to: '/dashboard', key: 'nav.dashboard' as const }
  const links = isAuthenticated ? [...PUBLIC_LINKS, privateLink] : PUBLIC_LINKS

  const onLogout = () => {
    logout()
    setOpen(false)
    void navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-sm focus:bg-surface focus:p-2">
        {t('nav.skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
        <Link to="/" aria-label={t('nav.home')} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-2 px-2 text-sm font-medium text-text">
                <UserRound className="size-4 text-muted" strokeWidth={1.75} aria-hidden="true" />
                {user?.fullName}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text"
              >
                <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm">
                {t('nav.login')}
              </ButtonLink>
              <ButtonLink to="/register" size="sm">
                {t('nav.register')}
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-sm text-text hover:bg-surface-2 md:hidden"
          aria-label={t('common.menu')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-4 pt-3 pb-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={navClass} onClick={() => setOpen(false)}>
                {t(l.key)}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="mt-4 flex gap-2">
            {isAuthenticated ? (
              <button type="button" onClick={onLogout} className="text-sm font-medium text-terracotta">
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <ButtonLink to="/login" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  {t('nav.login')}
                </ButtonLink>
                <ButtonLink to="/register" className="flex-1" onClick={() => setOpen(false)}>
                  {t('nav.register')}
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
