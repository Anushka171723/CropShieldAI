import { Navigate, Outlet, useLocation } from 'react-router-dom'
import FullPageLoader from '../components/FullPageLoader'
import { useAuth } from '../hooks/useAuth'
import { getPostLoginPath } from '../utils/roles'

// For pages such as /login and /register: signed-in users are sent on to their own area instead.
export default function PublicRoute() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageLoader />
  if (isAuthenticated) return <Navigate to={getPostLoginPath(user.role, location.state?.from)} replace />
  return <Outlet />
}
