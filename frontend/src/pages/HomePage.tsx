import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ClipboardList, Compass, Sparkles, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fetchDirections } from '@/api/directions'
import { fetchUniversities } from '@/api/universities'
import { MatchRing } from '@/components/domain/MatchRing'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useRegions } from '@/hooks/useReference'
import { homePathFor } from '@/lib/routes'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

export function HomePage() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const role = useAuthStore((s) => s.user?.role)
  const start = isAuthenticated ? homePathFor(role) : '/register'

  const universities = useQuery({ queryKey: ['stats', 'universities'], queryFn: () => fetchUniversities({ size: 1 }) })
  const directions = useQuery({ queryKey: ['stats', 'directions'], queryFn: () => fetchDirections({ size: 1 }) })
  const regions = useRegions()

  const steps = [
    { icon: ClipboardList, title: t('home.step1Title'), text: t('home.step1Text') },
    { icon: Compass, title: t('home.step2Title'), text: t('home.step2Text') },
    { icon: Sparkles, title: t('home.step3Title'), text: t('home.step3Text') },
  ]
  const stats = [
    { value: universities.data?.totalElements, label: t('home.statUniversities') },
    { value: directions.data?.totalElements, label: t('home.statDirections') },
    { value: regions.data?.length, label: t('home.statRegions') },
  ]

  return (
    <>
      {/* Hero */}
      <section className="girih border-b border-line">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Badge tone="primary">{t('home.eyebrow')}</Badge>
            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold text-text md:text-6xl">{t('home.title')}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t('home.subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={start} size="lg" icon={<ArrowRight className="size-5" />}>
                {t('home.cta')}
              </ButtonLink>
              <ButtonLink to="/universities" variant="secondary" size="lg">
                {t('home.browse')}
              </ButtonLink>
            </div>
          </div>

          {/* Sample recommendation card — illustrates the product without real data. */}
          <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
            <div className="absolute -inset-3 -rotate-2 rounded-lg bg-primary-soft" />
            <div className="relative rounded-lg border border-line bg-surface p-6 shadow-raised">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('home.sampleTitle')}</p>
              <div className="mt-4 flex items-center gap-4">
                <MatchRing percent={91} label={t('home.sampleMatch')} />
                <div>
                  <Badge tone="turquoise">{t('home.sampleSafe')}</Badge>
                  <p className="mt-2 font-display leading-snug font-bold text-text">Kompyuter ilmlari va dasturlash texnologiyalari</p>
                  <p className="mt-0.5 text-sm text-muted">TATU · Toshkent</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2 text-text">
                  <Star className="mt-0.5 size-4 shrink-0 fill-gold text-gold" />
                  {t('home.sampleReason1')}
                </li>
                <li className="flex gap-2 text-text">
                  <Star className="mt-0.5 size-4 shrink-0 fill-gold text-gold" />
                  {t('home.sampleReason2')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <h2 className="text-3xl font-extrabold text-text">{t('home.howTitle')}</h2>
        <p className="mt-2 text-lg text-muted">{t('home.howLead')}</p>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-lg border border-line bg-surface p-6 shadow-card">
              <span className="tabular absolute top-5 right-6 font-display text-5xl font-extrabold text-primary-soft" aria-hidden="true">
                {i + 1}
              </span>
              <span className="inline-flex rounded-md bg-primary-soft p-2.5 text-primary">
                <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-text">{title}</h3>
              <p className="mt-1.5 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-[1200px] grid-cols-3 gap-4 px-4 py-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="tabular font-display text-4xl font-extrabold text-primary md:text-5xl">{s.value ?? '—'}</p>
              <p className="mt-1 text-sm text-muted md:text-base">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="relative overflow-hidden rounded-lg bg-lapis-900 px-6 py-12 text-center text-white md:px-12">
          <div className="girih absolute inset-0 opacity-60 invert" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold md:text-4xl">{t('home.ctaTitle')}</h2>
            <p className="mt-3 text-white/80">{t('home.ctaText')}</p>
            <ButtonLink to={start} variant="accent" size="lg" className="mt-8" icon={<ArrowRight className="size-5" />}>
              {t('home.cta')}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
