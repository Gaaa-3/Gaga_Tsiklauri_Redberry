import { useEffect, useState } from 'react'

/** Returns `value` after it has stopped changing for `delay` ms.
 *
 *  Used by the header typeahead so a request leaves once the user pauses rather
 *  than once per keystroke. Setting state from the effect is the point here —
 *  the whole job is to publish a later copy of the value — so the timer is the
 *  external thing being synchronised, not a derived render. */
export function useDebounced(value, delay = 250) {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return settled
}
