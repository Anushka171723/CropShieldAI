import axios from 'axios'
import api, { getErrorMessage } from './api'

// Mock authentication exists for local development only. `import.meta.env.DEV` is false in production
// builds, so the mock adapter below is dropped from the bundle and can never authenticate anyone there.
export const isMockAuth = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

// What the real backend must provide (none of these exist yet - see AUTH.md):
//   POST /auth/login            { email, password, rememberMe }  -> { user }, sets the session cookie
//   POST /auth/register         { name, email, phone, password } -> { user }, role is always FARMER
//   POST /auth/logout                                            -> invalidates the session
//   GET  /auth/me                                                -> { user } or 401
//   POST /auth/forgot-password  { email }                        -> 200 whether or not the email exists
const realAdapter = {
  demoAccounts: [],
  async login(credentials) {
    return (await api.post('/auth/login', credentials)).data.user
  },
  async register(details) {
    return (await api.post('/auth/register', details)).data.user
  },
  async logout() {
    await api.post('/auth/logout')
  },
  async me() {
    try {
      return (await api.get('/auth/me')).data.user
    } catch (err) {
      if (err.response?.status === 401) return null // simply not signed in
      throw err
    }
  },
  async forgotPassword({ email }) {
    await api.post('/auth/forgot-password', { email })
    return { mock: false }
  },
}

let adapterPromise
const getAdapter = () => {
  adapterPromise ??= isMockAuth ? import('./mock/mockAuthAdapter').then((m) => m.default) : Promise.resolve(realAdapter)
  return adapterPromise
}

// Turns whatever the adapter threw into an Error with a readable message (and per-field messages, if any).
function toAuthError(err, fallback) {
  if (axios.isAxiosError(err)) {
    const error = new Error(getErrorMessage(err, fallback))
    error.status = err.response?.status
    error.fieldErrors = err.response?.data?.errors
    return error
  }
  return err
}

async function call(method, args, fallback) {
  const adapter = await getAdapter()
  try {
    return await adapter[method](args)
  } catch (err) {
    throw toAuthError(err, fallback)
  }
}

export const login = (credentials) => call('login', credentials, 'Unable to sign in. Please try again.')
export const register = (details) => call('register', details, 'Unable to create your account. Please try again.')
export const requestPasswordReset = (payload) => call('forgotPassword', payload, 'Unable to send the request. Please try again.')

// Logging out must always succeed locally, even if the server call fails.
export async function logout() {
  try {
    await call('logout', undefined, 'Unable to sign out.')
  } catch {
    /* the provider clears local state regardless */
  }
}

// Used on app start to restore a session. Resolves to the user, or null if not signed in.
export async function getCurrentUser() {
  try {
    return await call('me', undefined, 'Unable to check your session.')
  } catch {
    return null
  }
}

export async function getDemoAccounts() {
  return (await getAdapter()).demoAccounts
}
