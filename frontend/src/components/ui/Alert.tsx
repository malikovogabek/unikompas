import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'error' | 'success' | 'info'

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  error: { box: 'bg-terracotta-soft text-terracotta', icon: <AlertTriangle className="size-5 shrink-0" strokeWidth={1.75} /> },
  success: { box: 'bg-turquoise-soft text-turquoise', icon: <CheckCircle2 className="size-5 shrink-0" strokeWidth={1.75} /> },
  info: { box: 'bg-primary-soft text-primary', icon: <Info className="size-5 shrink-0" strokeWidth={1.75} /> },
}

export function Alert({ tone = 'info', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const t = tones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-md p-3 text-sm font-medium', t.box, className)}>
      {t.icon}
      <div>{children}</div>
    </div>
  )
}
