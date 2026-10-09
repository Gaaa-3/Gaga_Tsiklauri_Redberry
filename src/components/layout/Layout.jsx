import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

/** The 1920px shell every route renders inside. The navbar floats over the top
 *  of the page, so <main> gets no padding here — a page that is not a
 *  full-bleed hero wraps its content in <Page> to clear the navbar. */

export function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
