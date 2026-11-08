import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, fetchUsers } from '@/api/admin'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formatDate } from '@/lib/format'
import type { Role } from '@/types/api'

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search)
  const [role, setRole] = useState<Role | ''>('')
  const [page, setPage] = useState(0)
  const query = useQuery({ queryKey: adminKeys.users(debounced, role, page), queryFn: () => fetchUsers(debounced, role, page), placeholderData: keepPreviousData })

  return (
    <div>
      <PageHeader title={t('admin.users.title')} />
      <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0) }} />
        <Select label={t('admin.table.role')} value={role} onChange={(e) => { setRole(e.target.value as Role | ''); setPage(0) }}>
          <option value="">{t('common.all')}</option>
          <option value="APPLICANT">{t('admin.users.APPLICANT')}</option>
          <option value="ADMIN">{t('admin.users.ADMIN')}</option>
        </Select>
      </div>
      <div className="mt-4">
        <QueryState query={query} skeleton={<Skeleton className="h-96 rounded-lg" />}>
          {(p) => (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>{t('admin.table.name')}</Th>
                    <Th>{t('admin.table.email')}</Th>
                    <Th>{t('admin.table.role')}</Th>
                    <Th>{t('admin.table.created')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.content.length === 0 && (
                    <tr><Td colSpan={4} className="py-10 text-center text-muted">{t('admin.table.empty')}</Td></tr>
                  )}
                  {p.content.map((u) => (
                    <tr key={u.id}>
                      <Td className="font-semibold">{u.fullName}</Td>
                      <Td>{u.email}</Td>
                      <Td><Badge tone={u.role === 'ADMIN' ? 'gold' : 'neutral'}>{t(`admin.users.${u.role}`)}</Badge></Td>
                      <Td className="tabular">{formatDate(u.createdAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={p.page} totalPages={p.totalPages} onChange={setPage} />
            </>
          )}
        </QueryState>
      </div>
    </div>
  )
}
