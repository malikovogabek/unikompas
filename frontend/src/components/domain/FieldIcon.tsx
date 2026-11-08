import { Atom, Building2, Cog, Cpu, GraduationCap, Languages, Palette, Scale, Sprout, Stethoscope, TrendingUp, Users, type LucideIcon } from 'lucide-react'

// Explicit map instead of importing every lucide icon (keeps the bundle small).
const ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  cog: Cog,
  'building-2': Building2,
  stethoscope: Stethoscope,
  atom: Atom,
  'trending-up': TrendingUp,
  scale: Scale,
  users: Users,
  'graduation-cap': GraduationCap,
  languages: Languages,
  sprout: Sprout,
  palette: Palette,
}

export function FieldIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || GraduationCap
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />
}
