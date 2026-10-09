import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Everything inside the dialog that can take focus, for the focus trap. */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  widthClass = 'w-[448px]',
  showCloseButton = false,
}) {
  const panelRef = useRef(null)
  // Where focus was before the modal opened, so it can be handed back on close.
  const openerRef = useRef(null)
  // Kept in a ref so the key handler below never goes stale and never has to
  // be torn down and rebuilt when the parent re-renders.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  useEffect(() => {
    openerRef.current = document.activeElement
    // The page behind must not scroll while the modal is up.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    // Focus the first real control, which is the first input on both auth forms.
    const first = panelRef.current?.querySelector(FOCUSABLE)
    first?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      // Trap Tab inside the dialog, so focus cannot wander onto the page behind.
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      // Hand focus back to whatever opened the modal.
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [])
  /** Only a click that both starts and ends on the overlay closes it, so a drag
   *  that began inside the panel and released outside does not dismiss the form. */
  const downOnOverlay = useRef(false)
  const onOverlayMouseDown = useCallback((event) => {
    downOnOverlay.current = event.target === event.currentTarget
  }, [])
  const onOverlayClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget && downOnOverlay.current) onClose()
    },
    [onClose],
  )
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onMouseDown={onOverlayMouseDown}
      onClick={onOverlayClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-full overflow-y-auto rounded-3xl bg-page p-9 shadow-2xl shadow-black/60 ${widthClass}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-9 right-9 text-ink-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id={titleId} className="text-3xl font-extrabold">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}

        {children}

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-11 w-full rounded-full bg-surface text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Close
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
