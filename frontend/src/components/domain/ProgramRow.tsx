import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { formatScore, formatSum } from '@/lib/format'
import type { Program } from '@/types/api'
import { Sparkline } from './Sparkline'

type ProgramRowProps = {
  program: Program
  /** Which side of the program is the title: the direction (on a university page) or the university. */
  titleFrom: 'direction' | 'university'
}

export function ProgramRow({ program: p, titleFrom }: ProgramRowProps) {
  const { t } = useTranslation()
  const title = titleFrom === 'direction' ? p.direction.name : p.university.name
  const latest = p.latestScores
  return (
    <Link
      to={`/programs/${p.id}`}
      className="group grid gap-3 rounded-md border border-line bg-surface p-4 transition-colors hover:border-primary md:grid-cols-[1fr_auto_auto] md:items-center md:gap-6"
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-text group-hover:text-primary">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge>{t(`studyLanguage.${p.language}`)}</Badge>
          <Badge>{t(`studyForm.${p.studyForm}`)}</Badge>
          {p.grantQuota === 0 && <Badge tone="gold">{t('catalog.program.noGrant')}</Badge>}
          <span className="tabular text-xs text-muted">{formatSum(p.contractFee)}</span>
        </div>
      </div>

      <dl className="tabular grid grid-cols-2 gap-x-6 text-sm">
        <dt className="text-muted">{t('catalog.program.grant')}</dt>
        <dt className="text-muted">{t('catalog.program.contract')}</dt>
        <dd className="font-semibold text-text">{latest?.grantScore != null ? formatScore(latest.grantScore) : '—'}</dd>
        <dd className="font-semibold text-text">{latest?.contractScore != null ? formatScore(latest.contractScore) : '—'}</dd>
      </dl>

      <div className="flex items-center gap-3">
        <Sparkline
          values={p.scoreHistory.map((s) => s.grantScore ?? s.contractScore)}
          label={t('catalog.program.history')}
        />
        <ChevronRight className="size-5 text-muted group-hover:text-primary" aria-hidden="true" />
      </div>
    </Link>
  )
}
