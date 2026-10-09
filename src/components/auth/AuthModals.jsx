import { useAuth } from '../../auth/useAuth'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'

/** Mounted once, next to the router, so whichever modal the store has open
 *  renders above every page and survives navigation. */

export function AuthModals() {
  const { modal } = useAuth()
  if (modal === 'login') return <LoginModal />
  if (modal === 'register') return <RegisterModal />
  return null
}
