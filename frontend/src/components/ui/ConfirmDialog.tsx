import { useTranslation } from 'react-i18next'
import { Alert } from './Alert'
import { Button } from './Button'
import { Modal } from './Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  text: string
  confirmLabel: string
  loading?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, text, confirmLabel, loading, error, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-muted">{text}</p>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
    </Modal>
  )
}
