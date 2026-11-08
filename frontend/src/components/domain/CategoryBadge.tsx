import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { CATEGORY_TONE } from '@/lib/category'
import type { Category } from '@/types/api'

export function CategoryBadge({ category }: { category: Category }) {
  const { t } = useTranslation()
  return (
    <Badge tone={CATEGORY_TONE[category]} className="uppercase tracking-wide">
      {t(`category.${category}`)}
    </Badge>
  )
}
