import { cn } from '@/lib/cn'

/** Initials tile used instead of logos (demo data has none). */
export function UniversityMonogram({ name, shortName, className }: { name: string; shortName: string | null; className?: string }) {
  const label = (shortName ?? name.split(/\s+/).map((w) => w[0]).join('')).slice(0, 5)
  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-md bg-lapis-900 font-display text-sm font-extrabold tracking-tight text-white dark:bg-primary-soft dark:text-primary',
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </div>
  )
}
