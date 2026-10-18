import { Loader2 } from 'lucide-react'
import Logo from './Logo'

// Shown while the app checks whether a session already exists, so protected pages never flash.
export default function FullPageLoader({ label = 'Checking your session...' }) {
  return (
    <div role="status" className="flex min-h-screen flex-col items-center justify-center gap-5 bg-page">
      <Logo />
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin text-brand-600 motion-reduce:animate-none" /> {label}
      </p>
    </div>
  )
}
