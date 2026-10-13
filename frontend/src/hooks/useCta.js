import { useAuth } from './useAuth'
import { ROLE_HOME } from '../utils/roles'

// Where the main "Get Started" buttons should lead: registration for visitors, the dashboard for signed-in users.
export function useCta() {
  const { user } = useAuth()
  return user
    ? { to: ROLE_HOME[user.role], label: 'Go to Dashboard', signedIn: true }
    : { to: '/register', label: 'Get Started', signedIn: false }
}

