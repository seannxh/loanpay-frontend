import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { useAuth } from '@/context/AuthContext'

// Centralises error handling for API calls: an expired/invalid token logs the
// user out and bounces to /login; everything else becomes a message string.
export function useApiError() {
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handle = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiError) {
        if (err.isAuthError) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        setOffline(err.isConnectionError)
        setError(err.message)
      } else {
        setOffline(false)
        setError(fallback)
      }
    },
    [logout, navigate],
  )

  const clear = useCallback(() => {
    setError(null)
    setOffline(false)
  }, [])

  return { error, offline, handle, clear }
}
