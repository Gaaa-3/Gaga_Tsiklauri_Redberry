import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AuthModals } from './components/auth/AuthModals'
import { RequireAuth } from './components/auth/RequireAuth'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
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
          {/* Catches a render fault anywhere below and shows a message instead
              of unmounting to a black screen. */}
          <ErrorBoundary>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/movies/:slug" element={<MovieDetailPage />} />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ErrorBoundary>

          <AuthModals />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
