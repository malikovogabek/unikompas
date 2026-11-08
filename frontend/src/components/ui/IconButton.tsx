import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type IconButtonProps = ComponentProps<'button'> & { label: string; icon: ReactNode; tone?: 'default' | 'danger' }

/** Square icon-only button; `label` becomes the accessible name and tooltip. */
export function IconButton({ label, icon, tone = 'default', className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-sm text-muted transition-colors disabled:opacity-50',
        tone === 'danger' ? 'hover:bg-terracotta-soft hover:text-terracotta' : 'hover:bg-surface-2 hover:text-text',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  )
}
