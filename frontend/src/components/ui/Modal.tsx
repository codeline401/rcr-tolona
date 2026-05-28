import { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '../../lib/cn'
import Button from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export default function Modal({ open, onClose, title, children, footer, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  return (
    <dialog ref={dialogRef} className="modal" onCancel={onClose}>
      <div className={cn('modal-box', sizeMap[size], className)}>
        <div className="flex items-center justify-between">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          <Button
            variant="ghost"
            size="sm"
            className="btn-circle ml-auto"
            onClick={onClose}
            aria-label="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="py-4">{children}</div>

        {footer && <div className="modal-action">{footer}</div>}
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  )
}
