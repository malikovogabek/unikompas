import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, deleteUniversity, fetchAdminUniversities } from '@/api/admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th } from '@/components/ui/Table'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useRefLabel } from '@/hooks/useRefLabel'
import { formatInteger } from '@/lib/format'
import type { University } from '@/types/api'
import { UniversityFormDialog } from './UniversityFormDialog'

export function AdminUniversitiesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const refLabel = useRefLabel()
  const api = useApiErrorMessage()
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search)
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [deleting, setDeleting] = useState<University | null>(null)
  const query = useQuery({
    queryKey: adminKeys.universities(debounced, page),
    queryFn: () => fetchAdminUniversities(debounced, page),
    placeholderData: keepPreviousData,
  })
  const remove = useMutation({
    mutationFn: (id: number) => deleteUniversity(id),
    onSuccess: () => {
      setDeleting(null)
      void qc.invalidateQueries()
    },
  })

  return (
    <div>
      <PageHeader
        title={t('admin.nav.universities')}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            {t('common.create')}
          </Button>
        }
      />
      <SearchInput
        className="mt-6 max-w-md"
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPage(0)
        }}
        placeholder={t('catalog.universities.searchPlaceholder')}
      />
      <div className="mt-4">
        <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(p) => (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>{t('admin.table.name')}</Th>
                    <Th>{t('admin.table.region')}</Th>
                    <Th>{t('admin.table.type')}</Th>
                    <Th>{t('admin.table.rating')}</Th>
                    <Th className="text-right">{t('admin.table.actions')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.content.length === 0 && (
                    <tr>
                      <Td colSpan={5} className="py-10 text-center text-muted">
                        {t('admin.table.empty')}
                      </Td>
                    </tr>
                  )}
                  {p.content.map((u) => (
                    <tr key={u.id}>
                      <Td>
                        <p className="font-semibold">{u.name}</p>
                        {u.shortName && <p className="text-xs text-muted">{u.shortName}</p>}
                      </Td>
                      <Td>{refLabel('regions', u.region)}</Td>
                      <Td>
                        <Badge tone={u.type === 'STATE' ? 'primary' : 'neutral'}>{t(`universityType.${u.type}`)}</Badge>
                      </Td>
                      <Td>
                        <span className="tabular inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                          {formatInteger(u.rating)}
                        </span>
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <IconButton label={`${t('common.edit')}: ${u.name}`} icon={<Pencil className="size-4" />} onClick={() => setEditing(u.id)} />
                        <IconButton label={`${t('common.delete')}: ${u.name}`} tone="danger" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(u)} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={p.page} totalPages={p.totalPages} onChange={setPage} />
            </>
          )}
        </QueryState>
      </div>

      {editing !== null && <UniversityFormDialog id={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.delete.title')}
        text={t('admin.delete.text', { name: deleting?.name ?? '' })}
        confirmLabel={t('common.delete')}
        loading={remove.isPending}
        error={remove.isError ? api.message(remove.error) : undefined}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => {
          setDeleting(null)
          remove.reset()
        }}
      />
    </div>
  )
}
