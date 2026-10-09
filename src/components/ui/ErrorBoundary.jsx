import { Component } from 'react'

/** Without this, any render error anywhere unmounts the whole tree and leaves a
 *  black screen with nothing but a console message — which is exactly what the
 *  brief forbids ("never a blank screen, never just a console error").
 *
 *  A class component because componentDidCatch has no hook equivalent. */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="mx-auto flex w-content flex-col items-start px-page pt-48 pb-20">
        <h1 className="text-3xl font-extrabold">Something broke on this page</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Sorry — that is a fault on our side, not something you did. You can try again, or go back
          to the home page.
        </p>

        {/* The message is kept visible rather than hidden in the console: on a
            deployed build it is the only clue anyone has. */}
        <pre className="mt-6 max-w-full overflow-x-auto rounded-xl bg-surface p-4 text-xs text-brand">
          {String(error?.message ?? error)}
        </pre>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="h-11 rounded-full bg-brand px-6 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-raised"
          >
            Go home
          </a>
        </div>
      </div>
    )
  }
}
