import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { passwordValid } from '../password'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { error, offline, handle, clear } = useApiError()

  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordsMatch = password.length > 0 && password === confirm
  const canSubmit = passwordValid(password) && passwordsMatch && !submitting

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    clear()
    if (!passwordsMatch) {
      handle(new Error("Passwords don't match"), "Passwords don't match")
      return
    }
    setSubmitting(true)
    try {
      await register({ username, firstName, lastName, email, birthday, password })
      navigate('/', { replace: true })
    } catch (err) {
      handle(err, 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card wide">
        <h1>Create your account</h1>
        <p className="muted">Sign up to save and track your loans.</p>
        {error && <ErrorBanner message={error} offline={offline} />}
        <form onSubmit={onSubmit} className="stack">
          <label>
            Username
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="3-20 letters, numbers, or _"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <div className="field-grid">
            <label>
              First name
              <input
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label>
              Last name
              <input
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>

          <div className="field-grid">
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
            <label>
              Birthday
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </label>
          </div>

          <label>
            Password
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
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
