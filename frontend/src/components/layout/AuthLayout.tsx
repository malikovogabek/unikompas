import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

/** Two-column auth screen: brand panel (lapis + girih) and the form. */
export function AuthLayout() {
  const { t } = useTranslation()
  const points = [t('auth.aside.point1'), t('auth.aside.point2'), t('auth.aside.point3')]
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
      <aside className="relative hidden overflow-hidden rounded-lg bg-lapis-900 p-10 text-white md:flex md:flex-col md:justify-end">
        <div className="girih absolute inset-0 opacity-60 invert" aria-hidden="true" />
        <div className="relative">
          <h2 className="text-3xl leading-tight font-extrabold">{t('auth.aside.title')}</h2>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/85">
                <span className="flex size-6 items-center justify-center rounded-full bg-gold text-lapis-900">
                  <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
