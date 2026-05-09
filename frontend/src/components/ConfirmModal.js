import React, { useEffect, useRef } from 'react'
import Icon from './Icon'

const ConfirmModal = ({
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onCancel,
  onConfirm,
}) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    const previous = document.activeElement
    if (dialogRef.current) {
      const focusable = dialogRef.current.querySelector('button')
      if (focusable) focusable.focus()
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous && previous.focus) previous.focus()
    }
  }, [onCancel])

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--modal-scrim)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirm-title'
        aria-describedby='confirm-body'
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          width: '100%',
          maxWidth: 480,
          border: '1px solid var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 id='confirm-title' style={{ margin: 0 }}>{title}</h3>
          <button
            type='button'
            className='ps-btn ps-btn-icon'
            onClick={onCancel}
            aria-label='Close'
          >
            <Icon name='x' size={18} />
          </button>
        </div>
        <p id='confirm-body' style={{ marginTop: 8, marginBottom: 24, color: 'var(--fg-secondary)', fontSize: 'var(--text-body-sm)' }}>
          {body}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type='button' className='ps-btn ps-btn-ghost' onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type='button'
            className={`ps-btn ${danger ? 'ps-btn-danger' : 'ps-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
