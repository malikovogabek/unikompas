import type { ReactNode } from 'react'

type PageHeaderProps = { eyebrow?: ReactNode; title: string; lead?: string; actions?: ReactNode }

export function PageHeader({ eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <div className="mb-2 text-sm font-semibold text-primary">{eyebrow}</div>}
        <h1 className="text-3xl leading-tight font-extrabold text-text md:text-4xl">{title}</h1>
        {lead && <p className="mt-3 text-lg text-muted">{lead}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
