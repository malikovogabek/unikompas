import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

/** Minimal table primitives with design tokens; horizontally scrollable on small screens. */
export function Table({ className, ...rest }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
      <table className={cn('w-full min-w-[720px] text-sm', className)} {...rest} />
    </div>
  )
}

export function Th({ className, ...rest }: ComponentProps<'th'>) {
  return <th scope="col" className={cn('border-b border-line bg-surface-2 px-4 py-3 text-left text-xs font-semibold text-muted', className)} {...rest} />
}

export function Td({ className, ...rest }: ComponentProps<'td'>) {
  return <td className={cn('border-b border-line px-4 py-3 align-middle text-text', className)} {...rest} />
}
