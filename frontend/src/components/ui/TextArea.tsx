import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/cn'

type TextAreaProps = ComponentProps<'textarea'> & { label: string; error?: string }

export function TextArea({ label, error, className, id, ...rest }: TextAreaProps) {
  const autoId = useId()
  const areaId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={areaId} className="text-sm font-medium text-text">
        {label}
      </label>
      <textarea
        id={areaId}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${areaId}-error` : undefined}
        className={cn('w-full rounded-sm border bg-surface px-3 py-2 text-[15px] text-text', error ? 'border-terracotta' : 'border-line')}
        {...rest}
      />
      {error && (
        <p id={`${areaId}-error`} role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
    </div>
  )
}
