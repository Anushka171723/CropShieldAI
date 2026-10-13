import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, Phone, User } from 'lucide-react'
import AuthShell from '../../components/auth/AuthShell'
import Checkbox from '../../components/auth/Checkbox'
import FormAlert from '../../components/auth/FormAlert'
import PasswordField from '../../components/auth/PasswordField'
import TextField from '../../components/TextField'
import { useAuth } from '../../hooks/useAuth'
import { PASSWORD_HINT, focusFirstInvalid, isStrongPassword, isValidEmail, normalizeIndianMobile } from '../../utils/validation'

const PANEL = {
  heading: 'Join CropShield AI in a minute.',
  text: 'Report crop problems with a photo, get AI-backed results, and receive expert-validated advice in your language.',
  points: ['Free farmer account', 'Upload a photo of the affected crop', 'Get risk, advice and follow-up'],
}

const initial = { name: '', email: '', phone: '', password: '', confirm: '', accepted: false }
const linkClass = 'font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800'

export default function Register() {
  const { register } = useAuth()
  const formRef = useRef(null)

  const [form, setForm] = useState(initial)
  const [showPasswords, setShowPasswords] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!form.email.trim()) next.email = 'Enter your email address.'
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address, like name@example.com.'
    if (!normalizeIndianMobile(form.phone)) next.phone = 'Enter a valid 10-digit mobile number.'
    if (!isStrongPassword(form.password)) next.password = PASSWORD_HINT
    if (form.confirm !== form.password) next.confirm = 'The two passwords do not match.'
    if (!form.accepted) next.accepted = 'Please accept the Terms of Use and Privacy Policy to continue.'
    setErrors(next)
    if (Object.keys(next).length) focusFirstInvalid(formRef.current)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setSubmitError('')
    if (!validate()) return

    setLoading(true)
    try {
      // No role is sent: the server always creates public sign-ups as farmers.
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: normalizeIndianMobile(form.phone),
        password: form.password,
      })
    } catch (err) {
      if (err.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }))
        focusFirstInvalid(formRef.current)
      }
      setSubmitError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthShell
      panel={PANEL}
      title="Create your farmer account"
      subtitle="Expert and officer accounts are set up by an administrator, not through this form."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
        {submitError && <FormAlert>{submitError}</FormAlert>}

        <TextField label="Full name" icon={User} autoComplete="name" placeholder="e.g. Ramesh Patil" value={form.name} onChange={set('name')} error={errors.name} disabled={loading} />
        <TextField label="Email address" icon={Mail} type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={set('email')} error={errors.email} disabled={loading} />
        <TextField label="Mobile number" icon={Phone} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} error={errors.phone} disabled={loading} />

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            hint={PASSWORD_HINT}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            disabled={loading}
            visible={showPasswords}
            onToggle={() => setShowPasswords((s) => !s)}
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            disabled={loading}
            visible={showPasswords}
            onToggle={() => setShowPasswords((s) => !s)}
          />
        </div>

        <Checkbox
          checked={form.accepted}
          onChange={set('accepted')}
          error={errors.accepted}
          disabled={loading}
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Privacy Policy
              </Link>
              .
            </>
          }
        />

        <button type="submit" disabled={loading} className="btn-primary w-full px-4 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthShell>
  )
}
