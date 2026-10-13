import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '../services/api'
import * as authService from '../services/authService'
import { isKnownRole } from '../utils/roles'
import { AuthContext } from './authContext'

// The signed-in user lives only in memory. On every page load it is re-fetched from the server (/auth/me),
// so nothing in browser storage can be edited to change who the app thinks you are.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'authenticated' | 'unauthenticated'
  const [sessionExpired, setSessionExpired] = useState(false)

  const applyUser = useCallback((next) => {
    // Ignore a user object whose role we do not recognise rather than guessing what they may see.
    const valid = next && isKnownRole(next.role) ? next : null
    setUser(valid)
    setStatus(valid ? 'authenticated' : 'unauthenticated')
    return valid
  }, [])

  // Restore the session when the app opens.
  useEffect(() => {
    let active = true
    authService.getCurrentUser().then((current) => active && applyUser(current))
    return () => {
      active = false
    }
  }, [applyUser])

  // Any 401 from the API means the session is gone: sign out locally and tell the user why.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('unauthenticated')
      setSessionExpired(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(
    async (credentials) => {
      const signedIn = applyUser(await authService.login(credentials))
      if (!signedIn) throw new Error('Your account could not be signed in. Please contact support.')
      setSessionExpired(false)
      return signedIn
    },
    [applyUser],
  )

  const register = useCallback(
    async (details) => {
      const created = applyUser(await authService.register(details))
      if (!created) throw new Error('Your account was created but could not be signed in. Please try logging in.')
      setSessionExpired(false)
      return created
    },
    [applyUser],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setSessionExpired(false)
    applyUser(null)
  }, [applyUser])

  const refreshUser = useCallback(async () => applyUser(await authService.getCurrentUser()), [applyUser])
  const clearSessionExpired = useCallback(() => setSessionExpired(false), [])

  const value = useMemo(
    () => ({
      user,
      status,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
      sessionExpired,
      login,
      register,
      logout,
      refreshUser,
      clearSessionExpired,
    }),
    [user, status, sessionExpired, login, register, logout, refreshUser, clearSessionExpired],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
