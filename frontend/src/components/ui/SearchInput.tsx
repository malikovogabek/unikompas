import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const { t } = useTranslation()
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {t('common.search')}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-sm border border-line bg-surface pr-9 pl-9 text-[15px] text-text placeholder:text-muted/70 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t('common.resetFilters')}
            className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:text-text"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
