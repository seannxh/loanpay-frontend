import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { UserMenu } from './components/UserMenu'
import { LogoMark } from './components/icons'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewLoanPage } from './pages/NewLoanPage'
import { LoanDetailPage } from './pages/LoanDetailPage'
import { AccountPage } from './pages/AccountPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function Header() {
  const { isAuthenticated } = useAuth()
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        <span className="logo-mark">
          <LogoMark size={30} />
        </span>
        Loan<span className="brand-accent">Pay</span>
      </Link>
      {isAuthenticated ? (
        <nav className="header-nav">
          <UserMenu />
        </nav>
      ) : (
        <span className="header-tagline">Smart loan calculator &amp; tracker</span>
      )}
    </header>
  )
}

function App() {
  return (
    <>
      <Header />
      <main className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/loans/new" element={<NewLoanPage />} />
            <Route path="/loans/:loanId" element={<LoanDetailPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
