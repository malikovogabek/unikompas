import { cn } from '@/lib/cn'

type LogoProps = { className?: string; withText?: boolean }

/**
 * Brand mark: an eight-point girih star (Registan tilework) holding a compass needle —
 * "showing the right way".
 */
export function Logo({ className, withText = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <g transform="translate(16 16)">
          <rect x="-11" y="-11" width="22" height="22" rx="2" className="fill-lapis-900 dark:fill-primary" />
          <rect x="-11" y="-11" width="22" height="22" rx="2" transform="rotate(45)" className="fill-lapis-900 dark:fill-primary" />
          <circle r="8.5" className="fill-bg" />
          <path d="M0-7 2.4 0H-2.4z" className="fill-gold" />
          <path d="M0 7 2.4 0H-2.4z" className="fill-primary dark:fill-muted" />
          <circle r="1.3" className="fill-lapis-900 dark:fill-text" />
        </g>
      </svg>
      {withText && (
        <span className="font-display text-lg font-extrabold tracking-tight text-text">
          Uni<span className="text-primary">Kompas</span>
        </span>
      )}
    </span>
  )
}
