import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AccessDenied from '../pages/errors/AccessDenied'

// Place inside <ProtectedRoute>. Shows an access-denied page when the signed-in role is not allowed here.
export default function RoleProtectedRoute({ roles }) {
  const { user } = useAuth()
  return roles.includes(user.role) ? <Outlet /> : <AccessDenied />
}
