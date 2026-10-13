import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FullPageLoader from '../components/FullPageLoader'
import { useAuth } from '../hooks/useAuth'

// Requires a signed-in user. Visitors go to /login and come back to the page they asked for afterwards.
// This is a convenience for the interface only: the backend must authorise every request itself.
export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
