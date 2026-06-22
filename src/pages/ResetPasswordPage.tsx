import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '@/api/client'
import { useApiError } from '@/hooks/useApiError'
import { ErrorBanner } from '@/components/ErrorBanner'
import { PasswordChecklist } from '@/components/PasswordChecklist'
import { passwordValid } from '@/lib/password'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { error, offline, handle, clear } = useApiError()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit = !!token && passwordValid(password) && passwordsMatch && !submitting

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    clear()
    setSubmitting(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      handle(err, 'Could not reset password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Choose a new password</h1>
        {error && <ErrorBanner message={error} offline={offline} />}
        {!token && (
          <p className="muted">
            This reset link is missing its token. Please request a new one from{' '}
            <Link to="/forgot-password">Forgot password</Link>.
          </p>
        )}
        {done ? (
          <p className="muted">Password updated! Redirecting you to log in…</p>
        ) : (
          token && (
            <form onSubmit={onSubmit} className="stack">
              <label>
                New password
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <PasswordChecklist password={password} />
              <label>
                Confirm password
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {confirm.length > 0 && !passwordsMatch && (
                  <span className="hint danger-text">Passwords don't match.</span>
                )}
              </label>
              <button type="submit" disabled={!canSubmit}>
                {submitting ? 'Saving…' : 'Reset password'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  )
}
