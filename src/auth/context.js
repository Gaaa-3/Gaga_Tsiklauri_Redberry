/** The context object and its types live apart from the provider component so
 *  the provider file exports a component and nothing else, which is what React
 *  Fast Refresh (and eslint-plugin-react-refresh) wants. */
import { createContext } from 'react'

export const AuthContext = createContext(null)
