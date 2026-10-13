import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'

// Placeholder for the legal documents linked from the registration form.
export default function LegalPage({ title }) {
  return (
    <div className="min-h-screen bg-[#f8faf7] px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" aria-label="CropShield AI home">
          <Logo />
        </Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-brand-900">{title}</h1>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Draft placeholder. The official {title.toLowerCase()} has not been written yet and must be published before this product launches.
        </p>
        <Link to="/register" className="btn-secondary mt-8 px-5 py-2.5">
          Back to registration
        </Link>
      </div>
    </div>
  )
}
