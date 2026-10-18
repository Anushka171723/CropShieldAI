import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../utils/roles'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-5 text-center">
      <Link to="/" aria-label="CropShield AI home">
        <Logo />
      </Link>
      <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-brand-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">This page could not be found</h1>
      <p className="mt-3 max-w-md text-slate-600">The link may be broken, or the page may have been moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary px-6 py-3">
          Back to home
        </Link>
        {user && (
          <Link to={ROLE_HOME[user.role]} className="btn-secondary px-6 py-3">
            Go to my dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
