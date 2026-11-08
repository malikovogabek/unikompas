import { useTranslation } from 'react-i18next'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import type { RiasecProfile } from '@/types/api'

const ORDER = ['R', 'I', 'A', 'S', 'E', 'C'] as const

type RiasecRadarProps = {
  /** Values on a common scale (0..max). */
  profile: RiasecProfile
  max: number
  label: string
}

/** Single-series RIASEC radar: primary stroke with a 20% fill (CLAUDE.md §8.1). */
export function RiasecRadar({ profile, max, label }: RiasecRadarProps) {
  const { t } = useTranslation()
  const data = ORDER.map((k) => ({ type: t(`riasec.${k}.name`), value: profile[k.toLowerCase() as keyof RiasecProfile] }))
  return (
    <div className="h-72 w-full" role="img" aria-label={label}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--uk-line)" />
          <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--uk-muted)', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="var(--uk-primary)" strokeWidth={2} fill="var(--uk-primary)" fillOpacity={0.2} isAnimationActive={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
