import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { useCta } from '../../hooks/useCta'
import { NAV_LINKS } from '../../pages/public/landingContent'

const linkClass = 'hover:text-brand-800 hover:underline'

export default function LandingFooter() {
  const cta = useCta()

  return (
    <footer className="border-t border-slate-200 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
            Early detection, risk awareness and practical guidance for crop diseases and pests.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-sm font-semibold text-slate-900">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className={linkClass}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {cta.signedIn ? (
              <li>
                <Link to={cta.to} className={linkClass}>
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className={linkClass}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className={linkClass}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">Help</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Contact and help details will be added here before launch.</p>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} CropShield AI. All rights reserved.</p>
          <p>Photography: U.S. Department of Agriculture (public domain).</p>
        </div>
      </div>
    </footer>
  )
}
