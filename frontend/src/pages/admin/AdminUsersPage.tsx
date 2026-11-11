import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminKeys, fetchUsers, type UserSort } from '@/api/admin'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryState } from '@/components/ui/QueryState'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th } from '@/components/ui/Table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useNow } from '@/hooks/useNow'
import { formatDate, formatDateTime, formatInteger, formatRelative } from '@/lib/format'
import type { Role } from '@/types/api'

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search)
  const [role, setRole] = useState<Role | ''>('')
  const [sort, setSort] = useState<UserSort>('lastSeenAt')
  const [page, setPage] = useState(0)
  const now = useNow()
  const query = useQuery({ queryKey: adminKeys.users(debounced, role, sort, page), queryFn: () => fetchUsers(debounced, role, sort, page), placeholderData: keepPreviousData })

  return (
    <div>
      <PageHeader title={t('admin.users.title')} />
      <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(0) }} />
        <Select label={t('admin.table.role')} value={role} onChange={(e) => { setRole(e.target.value as Role | ''); setPage(0) }}>
          <option value="">{t('common.all')}</option>
          <option value="APPLICANT">{t('admin.users.APPLICANT')}</option>
          <option value="ADMIN">{t('admin.users.ADMIN')}</option>
        </Select>
        <Select label={t('admin.users.sort')} value={sort} onChange={(e) => { setSort(e.target.value as UserSort); setPage(0) }}>
          <option value="lastSeenAt">{t('admin.users.sortSeen')}</option>
          <option value="createdAt">{t('admin.users.sortCreated')}</option>
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
                    <Th>{t('admin.users.lastSeen')}</Th>
                    <Th className="text-right">{t('admin.users.logins')}</Th>
                    <Th>{t('admin.table.created')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {p.content.length === 0 && (
                    <tr><Td colSpan={6} className="py-10 text-center text-muted">{t('admin.table.empty')}</Td></tr>
                  )}
                  {p.content.map((u) => (
                    <tr key={u.id}>
                      <Td className="font-semibold">{u.fullName}</Td>
                      <Td>{u.email}</Td>
                      <Td><Badge tone={u.role === 'ADMIN' ? 'gold' : 'neutral'}>{t(`admin.users.${u.role}`)}</Badge></Td>
                      <Td className="whitespace-nowrap">
                        {u.lastSeenAt ? (
                          <time dateTime={u.lastSeenAt} title={formatDateTime(u.lastSeenAt)} className="text-text">
                            {formatRelative(u.lastSeenAt, undefined, now)}
                          </time>
                        ) : (
                          <span className="text-muted">{t('admin.users.never')}</span>
                        )}
                      </Td>
                      <Td className="tabular text-right">{formatInteger(u.loginCount)}</Td>
                      <Td className="tabular whitespace-nowrap">{formatDate(u.createdAt)}</Td>
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
