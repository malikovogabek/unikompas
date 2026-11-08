import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LineChart, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, deleteProgram, fetchAdminPrograms } from '@/api/admin'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th } from '@/components/ui/Table'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatInteger, formatScore, formatSum } from '@/lib/format'
import type { Program } from '@/types/api'
import { ProgramFormDialog } from './ProgramFormDialog'
import { ScoresDialog } from './ScoresDialog'
import { useCatalogOptions } from './useCatalogOptions'

export function AdminProgramsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const api = useApiErrorMessage()
  const options = useCatalogOptions()
  const [universityId, setUniversityId] = useState<number | undefined>()
  const [directionId, setDirectionId] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Program | 'new' | null>(null)
  const [scores, setScores] = useState<Program | null>(null)
  const [deleting, setDeleting] = useState<Program | null>(null)
  const query = useQuery({
    queryKey: adminKeys.programs(universityId, directionId, page),
    queryFn: () => fetchAdminPrograms(universityId, directionId, page),
    placeholderData: keepPreviousData,
  })
  const remove = useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: () => {
      setDeleting(null)
      void qc.invalidateQueries()
    },
  })
  const label = (p: Program) => `${p.university.shortName ?? p.university.name} — ${p.direction.name}`

  return (
    <div>
      <PageHeader
        title={t('admin.nav.programs')}
        actions={<Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>{t('common.create')}</Button>}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Select label={t('admin.table.university')} value={universityId ?? ''} onChange={(e) => { setUniversityId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}>
          <option value="">{t('common.all')}</option>
          {options.universities.map((u) => <option key={u.id} value={u.id}>{u.shortName ?? u.name}</option>)}
        </Select>
        <Select label={t('admin.table.direction')} value={directionId ?? ''} onChange={(e) => { setDirectionId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}>
          <option value="">{t('common.all')}</option>
          {options.directions.map((d) => <option key={d.id} value={d.id}>{`${d.code} — ${d.name}`}</option>)}
        </Select>
      </div>
      <div className="mt-4">
        <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(p) => (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>{t('admin.table.university')}</Th>
                    <Th>{t('admin.table.direction')}</Th>
                    <Th>{t('admin.table.languageForm')}</Th>
                    <Th>{t('admin.table.quotas')}</Th>
                    <Th>{t('admin.table.fee')}</Th>
                    <Th>{t('admin.table.scores')}</Th>
                    <Th className="text-right">{t('admin.table.actions')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.content.length === 0 && (
                    <tr><Td colSpan={7} className="py-10 text-center text-muted">{t('admin.table.empty')}</Td></tr>
                  )}
                  {p.content.map((row) => (
                    <tr key={row.id}>
                      <Td className="font-semibold">{row.university.shortName ?? row.university.name}</Td>
                      <Td>{row.direction.name}</Td>
                      <Td className="whitespace-nowrap">{t(`studyLanguage.${row.language}`)} / {t(`studyForm.${row.studyForm}`)}</Td>
                      <Td className="tabular whitespace-nowrap">{formatInteger(row.grantQuota)} / {formatInteger(row.contractQuota)}</Td>
                      <Td className="tabular whitespace-nowrap">{formatSum(row.contractFee)}</Td>
                      <Td className="tabular whitespace-nowrap">
                        {row.latestScores
                          ? `${row.latestScores.grantScore != null ? formatScore(row.latestScores.grantScore) : '—'} / ${row.latestScores.contractScore != null ? formatScore(row.latestScores.contractScore) : '—'}`
                          : '—'}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <IconButton label={`${t('admin.scores.title')}: ${label(row)}`} icon={<LineChart className="size-4" />} onClick={() => setScores(row)} />
                        <IconButton label={`${t('common.edit')}: ${label(row)}`} icon={<Pencil className="size-4" />} onClick={() => setEditing(row)} />
                        <IconButton label={`${t('common.delete')}: ${label(row)}`} tone="danger" icon={<Trash2 className="size-4" />} onClick={() => setDeleting(row)} />
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
      {editing !== null && <ProgramFormDialog program={editing} onClose={() => setEditing(null)} />}
      {scores && <ScoresDialog program={scores} onClose={() => setScores(null)} />}
      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.delete.title')}
        text={t('admin.delete.text', { name: deleting ? label(deleting) : '' })}
        confirmLabel={t('common.delete')}
        loading={remove.isPending}
        error={remove.isError ? api.message(remove.error) : undefined}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onClose={() => { setDeleting(null); remove.reset() }}
      />
    </div>
  )
}
