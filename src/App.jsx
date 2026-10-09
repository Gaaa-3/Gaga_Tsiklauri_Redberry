import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AuthModals } from './components/auth/AuthModals'
import { Layout } from './components/layout/Layout'
import { queryClient } from './lib/queryClient'
import { HomePage } from './pages/Home'
import { MovieDetailPage } from './pages/MovieDetail'
import { NotFoundPage } from './pages/NotFound'
import { ProfilePage } from './pages/Profile'
import { SessionsPage } from './pages/Sessions'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Inside the router, because a protected action replaying after login
            will need to navigate. */}
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/movies/:slug" element={<MovieDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>

          <AuthModals />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
