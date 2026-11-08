import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/cn'

type FavoriteButtonProps = { programId: number }

export function FavoriteButton({ programId }: FavoriteButtonProps) {
  const { t } = useTranslation()
  const fav = useFavorites()
  if (!fav.enabled) {
    return null
  }
  const saved = fav.isSaved(programId)
  const label = saved ? t('recommendations.unfav') : t('recommendations.fav')
  return (
    <button
      type="button"
      onClick={() => fav.toggle(programId)}
      disabled={fav.pendingId === programId}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-terracotta disabled:opacity-50"
    >
      <Heart className={cn('size-5', saved && 'fill-terracotta text-terracotta')} strokeWidth={1.75} />
    </button>
  )
}
