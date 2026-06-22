import type {
  AuthResponse,
  CreateLoanRequest,
  Installment,
  InstallmentStatus,
  LoanDetail,
  LoanRequest,
  LoanScheduleRepayment,
  LoanSummary,
  RegisterRequest,
  UserProfile,
} from '@/types'

// All requests go through the Vite dev proxy (/api -> http://localhost:8080).
const BASE = '/api'
const TOKEN_KEY = 'loanpay.token'

export class ApiError extends Error {
  /** True when the API server couldn't be reached at all (e.g. backend not running). */
  readonly isConnectionError: boolean
  /** True when the request was rejected as unauthenticated (expired/invalid token). */
  readonly isAuthError: boolean

  constructor(
    message: string,
    options: { isConnectionError?: boolean; isAuthError?: boolean } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.isConnectionError = options.isConnectionError ?? false
    this.isAuthError = options.isAuthError ?? false
  }
}

const OFFLINE_MESSAGE =
  "Can't reach the API. Make sure the Kotlin backend is running on port 8080 (./gradlew bootRun)."

// ---- Token storage (shared with AuthContext) ----
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    // 204/empty bodies are possible; guard against JSON parse on empty.
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
  }

  if (res.status === 401 || res.status === 403) {
    throw new ApiError('Your session has expired. Please log in again.', {
      isAuthError: true,
    })
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    throw new ApiError(OFFLINE_MESSAGE, { isConnectionError: true })
  }

  // Surface the backend's structured error messages.
  let detail = `Request failed (${res.status})`
  try {
    const body = await res.json()
    if (body?.messages && Array.isArray(body.messages)) {
      detail = body.messages.join(', ')
    } else if (body?.message) {
      detail = body.message
    }
  } catch {
    // Non-JSON error body — keep the generic message.
  }
  throw new ApiError(detail)
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean // attach the bearer token (default true)
}

async function request(path: string, opts: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, auth = true } = opts
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = tokenStore.get()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  try {
    return await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(OFFLINE_MESSAGE, { isConnectionError: true })
  }
}

// ---- Auth ----
export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return handle(await request('/auth/register', { method: 'POST', body: payload, auth: false }))
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  return handle(await request('/auth/login', { method: 'POST', body: { username, password }, auth: false }))
}

export async function getProfile(): Promise<UserProfile> {
  return handle(await request('/auth/me'))
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await handle(await request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }))
}

export async function forgotPassword(email: string): Promise<void> {
  await handle(await request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }))
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await handle(await request('/auth/reset-password', { method: 'POST', body: { token, newPassword }, auth: false }))
}

export async function sendTestReminder(): Promise<{ sent: boolean }> {
  return handle(await request('/auth/test-reminder', { method: 'POST' }))
}

// ---- Loans ----
export async function calculateLoan(loan: LoanRequest): Promise<LoanScheduleRepayment> {
  return handle(await request('/loans/calculate', { method: 'POST', body: loan }))
}

export async function listLoans(): Promise<LoanSummary[]> {
  return handle(await request('/loans'))
}

export async function createLoan(loan: CreateLoanRequest): Promise<LoanDetail> {
  return handle(await request('/loans', { method: 'POST', body: loan }))
}

export async function getLoan(loanId: string): Promise<LoanDetail> {
  return handle(await request(`/loans/${loanId}`))
}

export async function updateLoan(
  loanId: string,
  changes: { name?: string; category?: string; bank?: string },
): Promise<LoanDetail> {
  return handle(await request(`/loans/${loanId}`, { method: 'PATCH', body: changes }))
}

export async function deleteLoan(loanId: string): Promise<void> {
  await handle(await request(`/loans/${loanId}`, { method: 'DELETE' }))
}

export async function updateInstallmentStatus(
  installmentId: string,
  status: InstallmentStatus,
): Promise<Installment> {
  return handle(await request(`/loans/installments/${installmentId}`, { method: 'PATCH', body: { status } }))
}
