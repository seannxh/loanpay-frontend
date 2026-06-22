import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateLoan, createLoan } from '../api'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'
import { ScheduleTable } from '../components/ScheduleTable'
import { StatTile } from '../components/StatTile'
import { Calculator, ChartDown, Coins, Wallet } from '../components/icons'
import { LOAN_CATEGORIES } from '../categories'
import { money } from '../format'
import type { LoanScheduleRepayment } from '../types'

export function NewLoanPage() {
  const navigate = useNavigate()
  const { error, offline, handle, clear } = useApiError()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<string>('Other')
  const [purchaseAmount, setPurchaseAmount] = useState('1000')
  const [apr, setApr] = useState('12')
  const [installments, setInstallments] = useState('12')
  const [startDate, setStartDate] = useState('') // empty = starts today

  const [preview, setPreview] = useState<LoanScheduleRepayment | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)

  function loanRequest() {
    return {
      purchaseAmount: Number(purchaseAmount),
      annualPercentageRate: Number(apr),
      numberOfInstallments: Number(installments),
    }
  }

  async function onPreview() {
    clear()
    setPreviewing(true)
    try {
      setPreview(await calculateLoan(loanRequest()))
    } catch (err) {
      handle(err, 'Failed to calculate schedule')
    } finally {
      setPreviewing(false)
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    clear()
    setSaving(true)
    try {
      const loan = await createLoan({
        name,
        category,
        ...loanRequest(),
        startDate: startDate || null,
      })
      navigate(`/loans/${loan.id}`, { replace: true })
    } catch (err) {
      handle(err, 'Failed to save loan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack-lg">
      <h1>New loan</h1>
      {error && <ErrorBanner message={error} offline={offline} />}

      <section className="card">
        <form onSubmit={onSave} className="stack">
          <div className="field-grid">
            <label>
              Loan name
              <input
                type="text"
                required
                placeholder="e.g. Car, MacBook"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {LOAN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-grid">
            <label>
              Purchase amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
              />
            </label>
            <label>
              APR (%)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={apr}
                onChange={(e) => setApr(e.target.value)}
              />
            </label>
            <label>
              # of installments
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                required
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </label>
            <label>
              Start date
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="hint">Backdate it for a loan you already have.</span>
            </label>
          </div>

          <div className="row">
            <button type="button" className="secondary" onClick={onPreview} disabled={previewing}>
              {previewing ? 'Calculating…' : 'Preview schedule'}
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save to my loans'}
            </button>
          </div>
        </form>
      </section>

      {preview && (
        <section className="card">
          <h2>Preview</h2>
          <div className="totals">
            <StatTile icon={<Wallet />} label="Purchase" value={money(preview.purchaseAmount)} />
            <StatTile icon={<Calculator />} label="APR" value={`${Number(preview.apr)}%`} />
            <StatTile icon={<ChartDown />} label="Total Interest" value={money(preview.totalInterest)} />
            <StatTile
              icon={<Coins />}
              label="Total to Repay"
              value={money(preview.totalAmount)}
              featured
            />
          </div>
          <p className="muted small breakdown">
            Purchase {money(preview.purchaseAmount)} + interest {money(preview.totalInterest)} ={' '}
            {money(preview.totalAmount)} over {preview.installments.length} payments
          </p>
          <ScheduleTable installments={preview.installments} />
        </section>
      )}
    </div>
  )
}
