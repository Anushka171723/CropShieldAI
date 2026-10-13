import axios from 'axios'

// Only a base URL lives in the frontend - never API keys or secrets.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  // Sessions are expected to live in an HttpOnly cookie set by the backend, so the browser sends it
  // automatically and JavaScript never touches the credential. See AUTH.md.
  withCredentials: true,
})

// The auth provider registers a callback here so a 401 anywhere in the app signs the user out cleanly.
let unauthorizedHandler = null
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthCall = (error.config?.url || '').startsWith('/auth/') // a failed login is not an "expired session"

    if (status === 401 && !isAuthCall && unauthorizedHandler) unauthorizedHandler()
    if (status === 403) error.isForbidden = true // signed in, but not allowed: callers show an access message
    return Promise.reject(error)
  },
)

export default api

// One place to turn any failed request into text a farmer can read.
export function getErrorMessage(err, fallback) {
  if (!err.response) {
    return err.code === 'ECONNABORTED' ? 'The request timed out. Please try again.' : 'Cannot reach the server. Check your connection and try again.'
  }
  const { status, data } = err.response
  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (status === 403) return 'You do not have permission to do that.'
  if (status >= 500) return 'The server had a problem. Please try again shortly.'
  return data?.message || fallback
}

// Development-only mock data for screens whose backend is not ready. Always false in production builds.
export const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

export const mockDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))
