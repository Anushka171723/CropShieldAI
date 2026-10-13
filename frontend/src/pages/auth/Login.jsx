import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, Mail } from 'lucide-react'
import AuthShell from '../../components/auth/AuthShell'
import Checkbox from '../../components/auth/Checkbox'
import FormAlert from '../../components/auth/FormAlert'
import PasswordField from '../../components/auth/PasswordField'
import TextField from '../../components/TextField'
import { useAuth } from '../../hooks/useAuth'
import { getDemoAccounts, isMockAuth } from '../../services/authService'
import { ROLE_LABEL } from '../../utils/roles'
import { focusFirstInvalid, isValidEmail } from '../../utils/validation'

const PANEL = {
  heading: 'Welcome back to your fields.',
  text: 'Sign in to see your crop reports, local risk and alerts, or to review cases as an expert or officer.',
}

export default function Login() {
  const { login, sessionExpired } = useAuth()
  const location = useLocation()
  const formRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoAccounts, setDemoAccounts] = useState([])

  // Development only: lets you try each role without typing. Resolves to [] against a real backend.
  useEffect(() => {
    if (isMockAuth) getDemoAccounts().then(setDemoAccounts)
  }, [])

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address, like name@example.com.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) focusFirstInvalid(formRef.current)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return // no duplicate submissions
    setSubmitError('')
    if (!validate()) return

    setLoading(true)
    try {
      // On success the route guard moves the user to their dashboard (or the page they were trying to open).
      await login({ email: email.trim(), password, rememberMe })
    } catch (err) {
      setSubmitError(err.message)
      setPassword('')
      setLoading(false)
    }
  }

  const clear = (field) => setErrors((prev) => ({ ...prev, [field]: undefined }))
  const expired = sessionExpired || location.state?.reason === 'expired'

  return (
    <AuthShell
      panel={PANEL}
      title="Sign in to CropShield AI"
      subtitle="Use the email address you registered with."
      footer={
        <>
          New farmer?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
        {expired && !submitError && <FormAlert tone="info" title="Your session has ended">Please sign in again to continue.</FormAlert>}
        {submitError && <FormAlert>{submitError}</FormAlert>}

        <TextField
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="username"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clear('email')
          }}
          error={errors.email}
          disabled={loading}
        />

        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            clear('password')
          }}
          error={errors.password}
          disabled={loading}
        />

        <div className="flex items-center justify-between gap-4">
          <Checkbox label="Remember me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading} />
          <Link to="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full px-4 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {isMockAuth && demoAccounts.length > 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p className="font-semibold">Development mock sign-in. No backend is connected.</p>
          <p className="mt-0.5">This box does not appear in production builds. Fill a demo account:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoAccounts.map((a) => (
              <button
                key={a.role}
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail(a.email)
                  setPassword(a.password)
                  setErrors({})
                  setSubmitError('')
                }}
                className="rounded-md border border-amber-300 bg-white px-2.5 py-1 font-medium text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-60"
              >
                {ROLE_LABEL[a.role]}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthShell>
  )
}
