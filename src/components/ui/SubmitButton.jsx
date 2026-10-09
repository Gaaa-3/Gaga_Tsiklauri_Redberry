/** The full-width pill at the foot of every form. Disabled is a flat #505261
 *  (the bg-control token) rather than a faded red — that is how the Figma draws
 *  it, and it is the state both auth mockups are captured in. */

export function SubmitButton({ children, pending, disabled, pendingLabel = 'Please wait…' }) {
  const inactive = disabled || pending
  return (
    <button
      type="submit"
      disabled={inactive}
      aria-busy={pending || undefined}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-opacity ${inactive ? 'cursor-not-allowed bg-control text-ink-muted' : 'bg-brand text-ink hover:opacity-90'}`}
    >
      {pending && (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 animate-spin">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {pending ? pendingLabel : children}
    </button>
  )
}
