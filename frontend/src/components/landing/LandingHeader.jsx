import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../Logo'
import { useCta } from '../../hooks/useCta'
import { NAV_LINKS } from '../../pages/public/landingContent'

// Highlights the nav link of the section currently in view.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}

function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

const ids = NAV_LINKS.map((l) => l.id)

export default function LandingHeader() {
  const [open, setOpen] = useState(false)
  const active = useActiveSection(ids)
  const scrolled = useScrolled()
  const cta = useCta()

  return (
    <header className={`sticky top-0 z-40 border-b border-slate-200 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-[0_2px_12px_rgb(0_0_0/0.06)]' : ''}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#home" aria-label="CropShield AI, back to top" className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
          <Logo />
        </a>

        <nav className="hidden h-full items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ id, label }) => {
            const isActive = active === id
            return (
              <a
                key={id}
                href={`#${id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`relative flex h-full items-center text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-500 ${
                  isActive ? 'text-brand-800' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
                {/* active indicator slides in from the left */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-700 transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!cta.signedIn && (
            <Link to="/login" className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500 active:bg-slate-200 sm:block">
              Login
            </Link>
          )}
          <Link to={cta.to} className="btn-primary px-4 py-2">
            {cta.label}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500 active:bg-slate-200 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-slate-100 bg-white px-4 py-2 motion-safe:animate-fade md:hidden">
          {NAV_LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-slate-50 ${active === id ? 'bg-brand-50 text-brand-800' : 'text-slate-800'}`}
            >
              {label}
            </a>
          ))}
          {!cta.signedIn && (
            <Link to="/login" className="block rounded-md px-3 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
