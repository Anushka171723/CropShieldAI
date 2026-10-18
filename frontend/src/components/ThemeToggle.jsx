import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

// Icon button that switches between the light and dark theme. The label names the action, so screen
// readers hear "Switch to dark theme" rather than a bare "toggle".
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const label = `Switch to ${isDark ? 'light' : 'dark'} theme`

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand-500 ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
}
