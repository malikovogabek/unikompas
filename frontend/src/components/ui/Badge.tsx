import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'primary' | 'turquoise' | 'gold' | 'terracotta'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary-soft text-primary',
  turquoise: 'bg-turquoise-soft text-turquoise',
  gold: 'bg-gold-soft text-text',
  terracotta: 'bg-terracotta-soft text-terracotta',
}

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: BadgeTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone], className)}>
      {icon}
      {children}
    </span>
  )
}
