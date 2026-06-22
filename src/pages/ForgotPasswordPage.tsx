import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'

export function ForgotPasswordPage() {
  const { error, offline, handle, clear } = useApiError()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    clear()
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      handle(err, 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Reset password</h1>
        {error && <ErrorBanner message={error} offline={offline} />}
        {sent ? (
          <>
            <p className="muted">
              If an account exists for <strong>{email}</strong>, we've sent a reset link. It
              expires in 30 minutes — check your inbox.
            </p>
            <p className="muted">
              <Link to="/login">Back to log in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="muted">Enter your account email and we'll send you a reset link.</p>
            <form onSubmit={onSubmit} className="stack">
              <label>
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="muted">
              Remembered it? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
