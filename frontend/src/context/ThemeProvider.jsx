import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'

// The chosen theme is stored under this key. index.html reads the same key in an inline script so the
// right theme is on <html> before the first paint (no flash of the wrong theme).
export const THEME_STORAGE_KEY = 'cropshield_theme'

const BROWSER_CHROME_COLOR = { light: '#14532d', dark: '#111A17' }
const isTheme = (value) => value === 'light' || value === 'dark'

function readStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null // storage can be blocked (private windows); the theme then simply is not remembered
  }
}

const systemQuery = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null)

// Holds the active theme. An explicit choice (saved in localStorage) always wins; until the user makes
// one, the operating system's light/dark preference is used and followed if it changes.
export function ThemeProvider({ children }) {
  const [stored, setStored] = useState(readStoredTheme)
  const [system, setSystem] = useState(() => (systemQuery()?.matches ? 'dark' : 'light'))
  const theme = stored ?? system

  useEffect(() => {
    const query = systemQuery()
    if (!query) return
    const onChange = (e) => setSystem(e.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === THEME_STORAGE_KEY) setStored(isTheme(e.newValue) ? e.newValue : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Apply to the document: the CSS tokens key off data-theme, color-scheme themes native controls.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BROWSER_CHROME_COLOR[theme])
  }, [theme])

  const setTheme = useCallback((next) => {
    if (!isTheme(next)) return
    setStored(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* not remembered, but the theme still changes for this visit */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
