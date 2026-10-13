import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import AuthShell from '../../components/auth/AuthShell'
import FormAlert from '../../components/auth/FormAlert'
import TextField from '../../components/TextField'
import { requestPasswordReset } from '../../services/authService'
import { focusFirstInvalid, isValidEmail } from '../../utils/validation'

const PANEL = {
  heading: 'Locked out? It happens.',
  text: 'Enter your email address and we will send you the steps to choose a new password.',
}

export default function ForgotPassword() {
  const formRef = useRef(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { mock: boolean, email }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setSubmitError('')
    if (!isValidEmail(email)) {
      setError(email.trim() ? 'Enter a valid email address, like name@example.com.' : 'Enter your email address.')
      focusFirstInvalid(formRef.current)
      return
    }
    setError('')

    setLoading(true)
    try {
      const { mock } = await requestPasswordReset({ email: email.trim() })
      setResult({ mock, email: email.trim() })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      panel={PANEL}
      title="Reset your password"
      subtitle={result ? undefined : 'We will email you instructions if an account exists for this address.'}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      {result ? (
        result.mock ? (
          <FormAlert tone="info" title="Development placeholder: no email was sent">
            There is no mail service or password-reset endpoint connected yet. With a real backend, this page will call POST /auth/forgot-password for {result.email}.
          </FormAlert>
        ) : (
          <FormAlert tone="success" title="Check your email">
            If an account exists for {result.email}, we have sent instructions to reset the password. It can take a few minutes to arrive.
          </FormAlert>
        )
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError && <FormAlert>{submitError}</FormAlert>}
          <TextField
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            error={error}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-primary w-full px-4 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Sending...
              </>
            ) : (
              'Send reset instructions'
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
