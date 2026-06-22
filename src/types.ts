// TypeScript mirror of the Kotlin backend models (com.sean.payment_api.data).
// Note: BigDecimal / LocalDate values arrive as strings or numbers over JSON;
// we treat money/date fields as string|number and format them in the UI.

export type Money = string | number

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED'

// ---- Auth ----
export interface AuthResponse {
  token: string
  username: string
}

export interface RegisterRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  birthday: string // ISO date, e.g. "1998-04-12"
  password: string
}

export interface UserProfile {
  username: string
  firstName: string
  lastName: string
  email: string
  birthday: string
}

// ---- Loan calculation (preview) ----
export interface LoanRequest {
  purchaseAmount: number
  annualPercentageRate: number
  numberOfInstallments: number
  startDate?: string | null // ISO date; omit for "starts today"
}

export interface Installment {
  id: string
  loanId: string
  installmentNumber: number
  dueDate: string // ISO date, e.g. "2026-07-21"
  paymentAmount: Money
  principal: Money
  interest: Money
  remainingBalance: Money
  status: InstallmentStatus
}

export interface LoanScheduleRepayment {
  purchaseAmount: Money
  apr: Money
  totalInterest: Money
  totalAmount: Money
  installments: Installment[]
}

// ---- Saved loans ----
export interface CreateLoanRequest {
  name: string
  category: string
  bank: string
  purchaseAmount: number
  annualPercentageRate: number
  numberOfInstallments: number
  startDate?: string | null // ISO date; omit for "starts today"
}

export interface LoanSummary {
  id: string
  name: string
  category: string
  bank: string
  purchaseAmount: Money
  apr: Money
  numberOfInstallments: number
  startDate: string
  totalAmount: Money
  totalPaid: Money
  totalRemaining: Money
  paidCount: number
  totalCount: number
  nextDueDate: string | null
  nextPaymentAmount: Money | null
}

export interface LoanDetail {
  id: string
  name: string
  category: string
  bank: string
  purchaseAmount: Money
  apr: Money
  numberOfInstallments: number
  startDate: string
  totalInterest: Money
  totalAmount: Money
  totalPaid: Money
  totalRemaining: Money
  paidCount: number
  installments: Installment[]
}
