import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as api from '../api'
import { tokenStore } from '../api'
import type { AuthResponse, RegisterRequest } from '../types'

const USERNAME_KEY = 'loanpay.username'

interface AuthState {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USERNAME_KEY))

  const apply = useCallback((res: AuthResponse) => {
    tokenStore.set(res.token)
    localStorage.setItem(USERNAME_KEY, res.username)
    setToken(res.token)
    setUsername(res.username)
  }, [])

  const login = useCallback(
    async (u: string, p: string) => apply(await api.login(u, p)),
    [apply],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => apply(await api.register(payload)),
    [apply],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    localStorage.removeItem(USERNAME_KEY)
    setToken(null)
    setUsername(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ token, username, isAuthenticated: !!token, login, register, logout }),
    [token, username, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
