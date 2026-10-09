export function TextField({ label, error, valid, className, ...input }) {
  const id = input.id ?? `field-${input.name}`
  const border = error
    ? 'border-brand'
    : valid
      ? 'border-available'
      : 'border-transparent focus:border-line'
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        {...input}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 h-11 w-full rounded-xl border bg-surface px-4 text-sm text-ink transition-colors outline-none placeholder:text-ink-dim ${border}`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-brand">
          {error}
        </p>
      )}
    </div>
  )
}
