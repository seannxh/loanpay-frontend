import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="card empty">
      <h1>404</h1>
      <p className="muted">That page doesn't exist.</p>
      <Link className="button-link" to="/">
        Go to your loans
      </Link>
    </div>
  )
}
