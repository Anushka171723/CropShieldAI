import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navigation'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME, ROLE_LABEL } from '../../utils/roles'
import Logo from '../Logo'

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  return <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">{initials}</span>
}

// Compact horizontal navigation for every signed-in role. `extra` is an optional slot for role-specific
// header content (the farmer's location and weather chip).
export default function TopNavbar({ extra = null }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)
  const items = NAV_ITEMS[user.role]

  // Close menus and return to the top whenever the page changes.
  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false)
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `relative flex h-full items-center whitespace-nowrap px-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-500 xl:px-3 ${
      isActive ? 'text-brand-800 after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-brand-700 xl:after:inset-x-3' : 'text-slate-600 hover:text-slate-900'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROLE_HOME[user.role]} aria-label="CropShield AI, go to dashboard" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
          <Logo />
        </Link>

        <nav className="hidden h-full flex-1 items-center lg:flex" aria-label="Main">
          {items.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {extra}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <Avatar name={user.name} />
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  <p className="mt-1 text-xs font-medium text-brand-700">{ROLE_LABEL[user.role]}</p>
                </div>
                <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-menu"
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="app-mobile-menu" className="border-t border-slate-100 bg-white px-4 py-2 motion-safe:animate-fade lg:hidden" aria-label="Mobile">
          {items.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </nav>
      )}
    </header>
  )
}
