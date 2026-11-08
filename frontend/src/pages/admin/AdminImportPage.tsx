import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileUp } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { importPassingScores } from '@/api/admin'
import { toApiError } from '@/api/client'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, Td, Th } from '@/components/ui/Table'
import { useApiErrorMessage } from '@/hooks/useApiErrorMessage'
import { formatInteger } from '@/lib/format'

const SAMPLE = 'university,direction_code,language,study_form,year,grant_score,contract_score\nTATU,60610100,UZ,FULL_TIME,2026,157.2,127.2\nWIUT,60410100,EN,FULL_TIME,2026,,108.0\n'

export function AdminImportPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const api = useApiErrorMessage()
  const [file, setFile] = useState<File | null>(null)
  const upload = useMutation({
    mutationFn: (f: File) => importPassingScores(f),
    onSuccess: () => void qc.invalidateQueries(),
  })
  const fileError = toApiError(upload.error)?.fieldErrors?.file
  const report = upload.data
  const sampleHref = `data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE)}`

  return (
    <div>
      <PageHeader title={t('admin.import.title')} lead={t('admin.import.lead')} />
      <Card className="mt-8">
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            if (file) {
              upload.mutate(file)
            }
          }}
        >
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            {t('admin.import.file')}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                upload.reset()
              }}
              className="rounded-sm border border-line bg-surface p-2 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-primary-soft file:px-3 file:py-1.5 file:font-semibold file:text-primary"
            />
          </label>
          <Button type="submit" disabled={!file} loading={upload.isPending} icon={<FileUp className="size-4" />}>
            {t('admin.import.upload')}
          </Button>
          <a href={sampleHref} download="passing-scores-sample.csv" className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <Download className="size-4" aria-hidden="true" />
            {t('admin.import.template')}
          </a>
        </form>
        <pre className="mt-4 overflow-x-auto rounded-sm bg-surface-2 p-3 font-mono text-xs text-muted">{SAMPLE}</pre>
      </Card>

      {upload.isError && (
        <Alert tone="error" className="mt-6">
          {fileError ? t(`admin.import.fileErrors.${fileError}` as 'admin.import.fileErrors.Empty', { defaultValue: api.message(upload.error) }) : api.message(upload.error)}
        </Alert>
      )}

      {report && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">{t('admin.import.result')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              [t('admin.import.total'), report.totalRows, 'text-text'],
              [t('admin.import.created'), report.created, 'text-turquoise'],
              [t('admin.import.updated'), report.updated, 'text-primary'],
              [t('admin.import.errors'), report.errors.length, report.errors.length ? 'text-terracotta' : 'text-text'],
            ].map(([label, value, color]) => (
              <Card key={label as string} className="p-5">
                <p className="text-sm text-muted">{label}</p>
                <p className={`tabular mt-1 font-display text-3xl font-extrabold ${color as string}`}>{formatInteger(value as number)}</p>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            {report.errors.length === 0 ? (
              <Alert tone="success">{t('admin.import.noErrors')}</Alert>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>{t('admin.import.line')}</Th>
                    <Th>{t('admin.import.code')}</Th>
                    <Th>{t('admin.import.value')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {report.errors.map((e) => (
                    <tr key={`${e.line}-${e.code}`}>
                      <Td className="tabular">{e.line}</Td>
                      <Td>{t(`admin.import.errorCodes.${e.code}` as 'admin.import.errorCodes.COLUMN_COUNT', { defaultValue: e.code })}</Td>
                      <Td className="font-mono text-xs">{e.value}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
