import { createBrowserRouter } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import MainLayout from '../layouts/MainLayout'

// Lazy pages (will be filled in Phase 2+)
import { lazy, Suspense } from 'react'
import Spinner from '../components/ui/Spinner'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },

  // Protected routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: withSuspense(DashboardPage) },
          { path: '/dashboard', element: withSuspense(DashboardPage) },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: withSuspense(NotFoundPage) },
])
