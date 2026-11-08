import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applicantKeys, fetchFavorites } from '@/api/applicant'
import { FavoriteButton } from '@/components/domain/FavoriteButton'
import { ProgramRow } from '@/components/domain/ProgramRow'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { Skeleton } from '@/components/ui/Skeleton'

export function FavoritesPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const query = useQuery({ queryKey: applicantKeys.favorites(page), queryFn: () => fetchFavorites(page), placeholderData: keepPreviousData })
  return (
    <div>
      <h1 className="text-3xl font-extrabold">{t('favorites.title')}</h1>
      <p className="mt-2 text-muted">{t('favorites.lead')}</p>
      <div className="mt-8">
        <QueryState query={query} skeleton={<Skeleton className="h-64 rounded-lg" />}>
          {(p) =>
            p.content.length === 0 ? (
              <EmptyState
                icon={<Heart className="size-6" strokeWidth={1.75} />}
                title={t('favorites.empty')}
                text={t('favorites.emptyText')}
                action={<ButtonLink to="/recommendations">{t('nav.recommendations')}</ButtonLink>}
              />
            ) : (
              <>
                <ul className="flex flex-col gap-3">
                  {p.content.map((program) => (
                    <li key={program.id} className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <ProgramRow program={program} titleFrom="university" />
                        <p className="mt-1 pl-1 text-xs text-muted">{program.direction.name}</p>
                      </div>
                      <FavoriteButton programId={program.id} />
                    </li>
                  ))}
                </ul>
                <Pagination page={p.page} totalPages={p.totalPages} onChange={setPage} />
              </>
            )
          }
        </QueryState>
      </div>
    </div>
  )
}
