/** A failed request must never show a blank area or only a console error: it
 *  shows what went wrong and offers a way to try again. Used by every section
 *  that fetches. */
export function ErrorRetry({ message, onRetry, retrying }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-surface p-8">
      <p className="text-sm text-brand">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="h-11 rounded-full bg-surface-raised px-6 text-sm font-semibold transition-colors hover:bg-control disabled:opacity-50"
        >
          {retrying ? 'Retrying…' : 'Try again'}
        </button>
      )}
    </div>
  )
}
