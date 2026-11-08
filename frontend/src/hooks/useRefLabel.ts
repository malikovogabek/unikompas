import { useTranslation } from 'react-i18next'
import type { RefItem } from '@/types/api'

type RefKind = 'regions' | 'subjects' | 'fields'

/** Translates reference items by code, falling back to the server's Uzbek name. */
export function useRefLabel() {
  const { t } = useTranslation()
  return (kind: RefKind, item: RefItem | null | undefined): string =>
    item ? t(`${kind}.${item.code}` as 'regions.TASHKENT', { defaultValue: item.name }) : ''
}
