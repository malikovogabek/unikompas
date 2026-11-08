import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, deleteDirection, fetchAdminDirections } from '@/api/admin'
import { SubjectPair } from '@/components/domain/SubjectPair'
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
import type { Direction } from '@/types/api'
import { DirectionFormDialog } from './DirectionFormDialog'

export function AdminDirectionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const refLabel = useRefLabel()
  const api = useApiErrorMessage()
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search)
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Direction | null>(null)
  const query = useQuery({ queryKey: adminKeys.directions(debounced, page), queryFn: () => fetchAdminDirections(debounced, page), placeholderData: keepPreviousData })
  const remove = useMutation({
    mutationFn: (id: number) => deleteDirection(id),
    onSuccess: () => {
      setDeleting(null)
      void qc.invalidateQueries()
    },
  })

  return (
    <div>
      <PageHeader
        title={t('admin.nav.directions')}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            {t('common.create')}
          </Button>
        }
      />
      <SearchInput className="mt-6 max-w-md" value={search} onChange={(v) => { setSearch(v); setPage(0) }} placeholder={t('catalog.directions.searchPlaceholder')} />
      <div className="mt-4">
        <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(p) => (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>{t('admin.table.code')}</Th>
                    <Th>{t('admin.table.name')}</Th>
                    <Th>{t('admin.table.field')}</Th>
                    <Th>{t('admin.table.subjects')}</Th>
                    <Th className="text-right">{t('admin.table.actions')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.content.length === 0 && (
                    <tr>
                      <Td colSpan={5} className="py-10 text-center text-muted">{t('admin.table.empty')}</Td>
                    </tr>
                  )}
                  {p.content.map((d) => (
                    <tr key={d.id}>
                      <Td className="tabular font-mono text-xs">{d.code}</Td>
                      <Td className="font-semibold">{d.name}</Td>
                      <Td>{refLabel('fields', d.field)}</Td>
                      <Td><SubjectPair first={d.firstSubject} second={d.secondSubject} /></Td>
                      <Td className="text-right whitespace-nowrap">
                        <IconButton label={`${t('common.edit')}: ${d.name}`} icon={<Pencil className="size-4" />} onClick={() => setEditing(d.id)} />
                        <IconButton label={`${t('common.delete')}: ${d.name}`} tone="danger" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(d)} />
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
      {editing !== null && <DirectionFormDialog id={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.delete.title')}
        text={t('admin.delete.text', { name: deleting?.name ?? '' })}
        confirmLabel={t('common.delete')}
        loading={remove.isPending}
        error={remove.isError ? api.message(remove.error) : undefined}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => { setDeleting(null); remove.reset() }}
      />
    </div>
  )
}
