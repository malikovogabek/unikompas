import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('rounded-lg border border-line bg-surface p-6 shadow-card', className)} {...rest} />
}
