import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-content px-12 py-10">
        <Outlet />
      </main>
    </div>
  )
}
