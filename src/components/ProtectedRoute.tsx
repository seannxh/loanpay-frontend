import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Gate for authenticated routes: redirects to /login when there's no token.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
