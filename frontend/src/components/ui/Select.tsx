import { ChevronDown } from 'lucide-react'
import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type SelectProps = ComponentProps<'select'> & { label: string; error?: string; hideLabel?: boolean }

/** Native select (accessible, mobile-friendly) styled with design tokens. */
export function Select({ label, error, hideLabel, className, id, children, ...rest }: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={selectId} className={cn('text-sm font-medium text-text', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'h-11 w-full cursor-pointer appearance-none rounded-sm border bg-surface pr-9 pl-3 text-[15px] text-text',
            error ? 'border-terracotta' : 'border-line',
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
    </div>
  )
}
