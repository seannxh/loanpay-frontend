import { useEffect, useState } from 'react'
import { changePassword, getProfile, sendTestReminder } from '../api'
import { useAuth } from '../auth/AuthContext'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'
import { PasswordChecklist } from '../components/PasswordChecklist'
import { passwordValid } from '../password'
import { formatDate } from '../format'
import type { UserProfile } from '../types'

export function AccountPage() {
  const { logout } = useAuth()
  const { error, offline, handle, clear } = useApiError()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Change password
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [changing, setChanging] = useState(false)
  const [pwMsg, setPwMsg] = useState<string | null>(null)

  // Test reminder
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    clear()
    getProfile()
      .then((p) => active && setProfile(p))
      .catch((err) => active && handle(err, 'Failed to load your profile'))
    return () => {
      active = false
    }
  }, [handle, clear])

  const matches = next.length > 0 && next === confirm
  const canChange = current.length > 0 && passwordValid(next) && matches && !changing

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    clear()
    setPwMsg(null)
    setChanging(true)
    try {
      await changePassword(current, next)
      setPwMsg('Password updated.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      handle(err, 'Failed to change password')
    } finally {
      setChanging(false)
    }
  }

  async function onTestReminder() {
    clear()
    setTestMsg(null)
    setTesting(true)
    try {
      const { sent } = await sendTestReminder()
      setTestMsg(
        sent
          ? 'Test email sent — check your inbox.'
          : "Couldn't send: SMTP isn't configured on the backend yet.",
      )
    } catch (err) {
      handle(err, 'Failed to send test email')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="stack-lg">
      <h1>Account</h1>
      {error && <ErrorBanner message={error} offline={offline} />}
      {!profile && !error && <p className="muted">Loading…</p>}

      {profile && (
        <>
          <section className="card">
            <div className="profile-grid">
              <div>
                <span className="totals-label">Name</span>
                <span className="profile-value">
                  {profile.firstName} {profile.lastName}
                </span>
              </div>
              <div>
                <span className="totals-label">Username</span>
                <span className="profile-value">@{profile.username}</span>
              </div>
              <div>
                <span className="totals-label">Email</span>
                <span className="profile-value">{profile.email}</span>
              </div>
              <div>
                <span className="totals-label">Birthday</span>
                <span className="profile-value">{formatDate(profile.birthday)}</span>
              </div>
            </div>
            <div className="row">
              <button type="button" className="secondary" onClick={onTestReminder} disabled={testing}>
                {testing ? 'Sending…' : 'Send a test reminder email'}
              </button>
              <button type="button" className="secondary" onClick={logout}>
                Log out
              </button>
            </div>
            {testMsg && <p className="muted small">{testMsg}</p>}
          </section>

          <section className="card">
            <h2>Change password</h2>
            <form onSubmit={onChangePassword} className="stack">
              <label>
                Current password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </label>
              <PasswordChecklist password={next} />
              <label>
                Confirm new password
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {confirm.length > 0 && !matches && (
                  <span className="hint danger-text">Passwords don't match.</span>
                )}
              </label>
              <div className="row">
                <button type="submit" disabled={!canChange}>
                  {changing ? 'Saving…' : 'Update password'}
                </button>
                {pwMsg && <span className="muted small">{pwMsg}</span>}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  )
}
