import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../Logo'
import SmartImage from '../landing/SmartImage'

// Shared frame for Login, Register and Forgot Password: field photo with a flat green overlay on large
// screens, and the form on a plain page. `panel` customises the text on the photo.
export default function AuthShell({ panel, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <SmartImage src="/images/hero-farmer-wheat.jpg" alt="" position="60% center" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-brand-950/80" aria-hidden="true" />
        <Link to="/" className="relative w-fit rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="CropShield AI home">
          <Logo light />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{panel.heading}</h2>
          <p className="mt-4 text-brand-100/90">{panel.text}</p>
          {panel.points && (
            <ul className="mt-6 space-y-2.5 text-sm text-brand-50">
              {panel.points.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="relative text-xs text-brand-200/80">Photo: U.S. Department of Agriculture (public domain)</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Logo className="lg:hidden" />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
