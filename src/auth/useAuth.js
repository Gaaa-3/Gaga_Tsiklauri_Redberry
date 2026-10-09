import { useContext } from 'react'
import { AuthContext } from './context'

/** Throws rather than handing back a half-empty object, so a component mounted
 *  outside the provider fails loudly in development instead of silently acting
 *  like a guest. */

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
