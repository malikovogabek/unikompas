import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  error?: string
  hint?: string
  trailing?: ReactNode
}

/** Labelled input with hint and error wired to aria-describedby / aria-invalid. */
export function TextField({ label, error, hint, trailing, className, id, ...input }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-sm border bg-surface px-3 text-[15px] text-text placeholder:text-muted/70',
            'transition-colors focus:border-primary',
            error ? 'border-terracotta' : 'border-line',
            trailing ? 'pr-11' : undefined,
          )}
          {...input}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
