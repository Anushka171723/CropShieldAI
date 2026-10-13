// DEVELOPMENT ONLY. Stands in for the real backend until /auth/* exists.
// It is only ever imported from authService behind `import.meta.env.DEV`, so it is not part of production builds.
//
// - Passwords below are throwaway demo values for local development, not real credentials.
// - The browser stores only a session id; the user (and their role) is always looked up here, never read
//   from storage, so editing localStorage cannot change a role.
// - Accounts created via Register live in memory only and disappear on reload.
import { mockDelay } from '../api'

const USERS = [
  { id: 'u-farmer', name: 'Ramesh Patil', email: 'farmer@demo.test', phone: '9876543210', password: 'Demo@1234', role: 'FARMER' },
  { id: 'u-expert', name: 'Dr. Sunita Deshmukh', email: 'expert@demo.test', phone: '9876500001', password: 'Demo@1234', role: 'EXPERT' },
  { id: 'u-officer', name: 'Anil Kulkarni', email: 'officer@demo.test', phone: '9876500002', password: 'Demo@1234', role: 'OFFICER' },
  { id: 'u-admin', name: 'System Admin', email: 'admin@demo.test', phone: '9876500003', password: 'Demo@1234', role: 'ADMIN' },
]

const registered = []
const failedAttempts = new Map()
const SESSION_KEY = 'cropshield_dev_session'
const MAX_ATTEMPTS = 5

const everyone = () => [...USERS, ...registered]
const toPublicUser = ({ password: _password, ...user }) => user // never hand the password back out

const fail = (message, fieldErrors) => Object.assign(new Error(message), { fieldErrors })

function saveSession(userId, remember) {
  const [keep, drop] = remember ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
  keep.setItem(SESSION_KEY, userId)
  drop.removeItem(SESSION_KEY)
}

const readSession = () => localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)

const mockAuthAdapter = {
  demoAccounts: USERS.map(({ role, email, password }) => ({ role, email, password })),

  async login({ email, password, rememberMe }) {
    await mockDelay(700)
    const key = email.trim().toLowerCase()
    if ((failedAttempts.get(key) || 0) >= MAX_ATTEMPTS) throw fail('Too many attempts. Please wait a few minutes and try again.')

    const user = everyone().find((u) => u.email.toLowerCase() === key && u.password === password)
    if (!user) {
      failedAttempts.set(key, (failedAttempts.get(key) || 0) + 1)
      throw fail('Incorrect email or password.') // same message whether the email exists or not
    }
    failedAttempts.delete(key)
    saveSession(user.id, rememberMe)
    return toPublicUser(user)
  },

  async register({ name, email, phone, password }) {
    await mockDelay(900)
    if (everyone().some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw fail('Please check the highlighted field.', { email: 'An account with this email already exists.' })
    }
    // The server decides the role. Public registration can only ever create farmers.
    const user = { id: `u-${Date.now()}`, name, email: email.trim(), phone, password, role: 'FARMER' }
    registered.push(user)
    saveSession(user.id, false)
    return toPublicUser(user)
  },

  async logout() {
    await mockDelay(150)
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  },

  async me() {
    await mockDelay(250)
    const id = readSession()
    const user = id && everyone().find((u) => u.id === id)
    return user ? toPublicUser(user) : null
  },

  async forgotPassword() {
    await mockDelay(700)
    return { mock: true } // nothing is sent: there is no mail service in development
  },
}

export default mockAuthAdapter
