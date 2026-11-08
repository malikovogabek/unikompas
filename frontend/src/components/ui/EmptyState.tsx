import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EmptyStateProps = { icon?: ReactNode; title: string; text?: string; action?: ReactNode; className?: string }

export function EmptyState({ icon, title, text, action, className }: EmptyStateProps) {
  return (
    <div className={cn('girih flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-14 text-center', className)}>
      {icon && <div className="mb-4 rounded-full bg-primary-soft p-3 text-primary">{icon}</div>}
      <h2 className="text-xl font-bold text-text">{title}</h2>
      {text && <p className="mt-2 max-w-md text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
