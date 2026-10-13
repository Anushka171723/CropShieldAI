import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import PageContainer from '../../components/PageContainer'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME, ROLE_LABEL } from '../../utils/roles'

// Shown inside the app layout when a signed-in user opens another role's page.
export default function AccessDenied() {
  const { user } = useAuth()
  return (
    <PageContainer className="flex flex-col items-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-brand-900">You do not have access to this page</h1>
      <p className="mt-2 max-w-md text-slate-600">
        You are signed in as {ROLE_LABEL[user.role].toLowerCase()}, and this page is for a different role.
      </p>
      <Link to={ROLE_HOME[user.role]} className="btn-primary mt-7 px-6 py-3">
        Go to my dashboard
      </Link>
    </PageContainer>
  )
}
