import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

type ModalProps = { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }

/**
 * Native <dialog> modal: focus trap, Esc to close and inert background come from the
 * browser. The body scrolls inside the dialog; the footer stays visible.
 */
export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      aria-labelledby={titleId}
      className={cn(
        'm-auto max-h-[90dvh] w-[calc(100%-2rem)] flex-col overflow-hidden rounded-lg border border-line bg-surface p-0 text-text shadow-raised backdrop:bg-lapis-900/50 open:flex',
        wide ? 'max-w-3xl' : 'max-w-lg',
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label={t('common.close')} className="inline-flex size-8 items-center justify-center rounded-sm text-muted hover:bg-surface-2">
          <X className="size-5" />
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
    </dialog>
  )
}
