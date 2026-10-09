import { useSyncExternalStore } from 'react'
import { readRecentlyViewed } from '../lib/recentlyViewed'

/** localStorage is state that lives outside React, which is exactly what
 *  useSyncExternalStore is for. Subscribing to `storage` means opening a film in
 *  a second tab updates the list here too, and reading through a cached
 *  snapshot keeps the returned array referentially stable between renders —
 *  without that, every render would hand back a new array and loop. */

let snapshot = readRecentlyViewed()
let serialised = JSON.stringify(snapshot)

const listeners = new Set()

function refresh() {
  const next = readRecentlyViewed()
  const nextSerialised = JSON.stringify(next)
  if (nextSerialised === serialised) return
  snapshot = next
  serialised = nextSerialised
  for (const listener of listeners) listener()
}

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('storage', refresh)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', refresh)
  }
}

/** Call after writing, so the current tab re-renders — `storage` only fires in
 *  the *other* tabs. */
export function notifyRecentlyViewedChanged() {
  refresh()
}

/** @returns {string[]} slugs, most recently opened first. */
export function useRecentlyViewed() {
  return useSyncExternalStore(subscribe, () => snapshot)
}
