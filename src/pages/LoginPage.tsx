import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { error, offline, handle, clear } = useApiError()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    clear()
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      handle(err, 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Log in to track your loan payments.</p>
        {error && <ErrorBanner message={error} offline={offline} />}
        <form onSubmit={onSubmit} className="stack">
          <label>
            Username
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="muted">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
