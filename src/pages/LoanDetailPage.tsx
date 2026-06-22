import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteLoan, getLoan, updateInstallmentStatus, updateLoan } from '../api'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'
import { ScheduleTable } from '../components/ScheduleTable'
import { StatTile } from '../components/StatTile'
import { ChartDown, CheckCircle, Coins, Wallet } from '../components/icons'
import { Fireworks } from '../components/Fireworks'
import { LOAN_CATEGORIES } from '../categories'
import { money } from '../format'
import type { Installment, LoanDetail } from '../types'

export function LoanDetailPage() {
  const { loanId } = useParams<{ loanId: string }>()
  const navigate = useNavigate()
  const { error, offline, handle, clear } = useApiError()
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Inline edit (name + category)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('Other')
  const [savingEdit, setSavingEdit] = useState(false)

  function startEdit() {
    if (!loan) return
    setEditName(loan.name)
    setEditCategory(loan.category)
    setEditing(true)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!loanId) return
    clear()
    setSavingEdit(true)
    try {
      setLoan(await updateLoan(loanId, { name: editName, category: editCategory }))
      setEditing(false)
    } catch (err) {
      handle(err, 'Failed to update loan')
    } finally {
      setSavingEdit(false)
    }
  }

  const load = useCallback(() => {
    if (!loanId) return
    clear()
    getLoan(loanId)
      .then(setLoan)
      .catch((err) => handle(err, 'Failed to load loan'))
  }, [loanId, handle, clear])

  useEffect(load, [load])

  async function markPaid(inst: Installment) {
    if (!loanId || !loan) return
    clear()
    setNotice(null)

    // Payments must be made in order — block paying ahead of an earlier one.
    const earliestUnpaid = loan.installments
      .filter((i) => i.status !== 'PAID')
      .sort((a, b) => a.installmentNumber - b.installmentNumber)[0]
    if (earliestUnpaid && inst.installmentNumber !== earliestUnpaid.installmentNumber) {
      setNotice(`Please pay installment #${earliestUnpaid.installmentNumber} first.`)
      return
    }

    setUpdatingId(inst.id)
    try {
      await updateInstallmentStatus(inst.id, 'PAID')
      const updated = await getLoan(loanId)
      setLoan(updated)
      // Celebrate when this payment was the final one.
      if (updated.installments.length > 0 && updated.paidCount === updated.installments.length) {
        setCelebrate(true)
      }
    } catch (err) {
      handle(err, 'Failed to update installment')
    } finally {
      setUpdatingId(null)
    }
  }

  async function onDelete() {
    if (!loanId) return
    if (!window.confirm('Delete this loan and its schedule? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteLoan(loanId)
      navigate('/', { replace: true })
    } catch (err) {
      handle(err, 'Failed to delete loan')
      setDeleting(false)
    }
  }

  const fullyPaid = !!loan && loan.installments.length > 0 && loan.paidCount === loan.installments.length
  const pct = loan && loan.installments.length
    ? Math.round((loan.paidCount / loan.installments.length) * 100)
    : 0

  return (
    <div className="stack-lg">
      {celebrate && <Fireworks onDone={() => setCelebrate(false)} />}

      <Link to="/" className="back-link">
        ← Back to your loans
      </Link>

      {error && <ErrorBanner message={error} offline={offline} />}
      {notice && (
        <div className="notice" role="alert">
          {notice}
          <button type="button" className="notice-close" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}
      {!loan && !error && <p className="muted">Loading…</p>}

      {loan && (
        <>
          {editing ? (
            <form className="card edit-form" onSubmit={saveEdit}>
              <div className="field-grid">
                <label>
                  Loan name
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </label>
                <label>
                  Category
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    {LOAN_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="row">
                <button type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditing(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="row-between">
              <div className="title-row">
                <h1>{loan.name}</h1>
                <span className="category-chip">{loan.category}</span>
                <span className="apr-chip">{Number(loan.apr)}% APR</span>
              </div>
              <div className="row">
                <button type="button" className="secondary" onClick={startEdit}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={onDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete loan'}
                </button>
              </div>
            </div>
          )}

          {fullyPaid && (
            <div className="celebrate-banner">🎉 This loan is fully paid off — nice work!</div>
          )}

          <section className="card">
            <div className="totals">
              <StatTile
                icon={<Coins />}
                label="Total to Repay"
                value={money(loan.totalAmount)}
                featured
              />
              <StatTile icon={<CheckCircle />} label="Paid" value={money(loan.totalPaid)} />
              <StatTile icon={<Wallet />} label="Remaining" value={money(loan.totalRemaining)} />
              <StatTile icon={<ChartDown />} label="Total Interest" value={money(loan.totalInterest)} />
            </div>
            <p className="muted small breakdown">
              PURCHASE {money(loan.purchaseAmount)} + INTEREST {money(loan.totalInterest)} ={' '}
              {money(loan.totalAmount)} TOTAL TO REPAY
            </p>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${pct}%` }} />
            </div>
            <p className="muted small">
              {loan.paidCount} of {loan.installments.length} PAYMENTS MADE ({pct}%)
            </p>
          </section>

          <section className="card">
            <h2>Payment Schedule</h2>
            <ScheduleTable
              installments={loan.installments}
              onMarkPaid={markPaid}
              updatingId={updatingId}
            />
          </section>
        </>
      )}
    </div>
  )
}
