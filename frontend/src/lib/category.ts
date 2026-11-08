import type { BadgeTone } from '@/components/ui/Badge'
import type { Category } from '@/types/api'

/** SAFE → turquoise, TARGET → lapis, REACH → terracotta (CLAUDE.md §8.1). */
export const CATEGORY_TONE: Record<Category, BadgeTone> = { SAFE: 'turquoise', TARGET: 'primary', REACH: 'terracotta' }

export const CATEGORY_COUNT_CLASS: Record<Category, string> = {
  SAFE: 'bg-turquoise-soft text-turquoise',
  TARGET: 'bg-primary-soft text-primary',
  REACH: 'bg-terracotta-soft text-terracotta',
}
