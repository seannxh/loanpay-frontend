import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listLoans } from '../api'
import { useApiError } from '../useApiError'
import { ErrorBanner } from '../components/ErrorBanner'
import { StatTile } from '../components/StatTile'
import { Coins, Layers, Wallet, CheckCircle } from '../components/icons'
import { money, formatDate } from '../format'
import type { LoanSummary } from '../types'

type SortKey = 'newest' | 'name' | 'category'

export function DashboardPage() {
  const { error, offline, handle, clear } = useApiError()
  const [loans, setLoans] = useState<LoanSummary[] | null>(null)
  const [sort, setSort] = useState<SortKey>('newest')

  useEffect(() => {
    let active = true
    clear()
    listLoans()
      .then((data) => active && setLoans(data))
      .catch((err) => {
        if (active) {
          handle(err, 'Failed to load your loans')
          setLoans([])
        }
      })
    return () => {
      active = false
    }
  }, [handle, clear])

  // Backend returns newest-first; re-sort a copy for the other options.
  const sorted = useMemo(() => {
    if (!loans) return loans
    const copy = [...loans]
    if (sort === 'name') copy.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'category')
      copy.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    return copy
  }, [loans, sort])

  // Aggregate totals across all loans for the overview bar.
  const overview = useMemo(() => {
    if (!loans || loans.length === 0) return null
    const num = (v: string | number) => Number(v) || 0
    return {
      activeCount: loans.filter((l) => l.paidCount < l.totalCount).length,
      totalToRepay: loans.reduce((s, l) => s + num(l.totalAmount), 0),
      totalPaid: loans.reduce((s, l) => s + num(l.totalPaid), 0),
      totalRemaining: loans.reduce((s, l) => s + num(l.totalRemaining), 0),
    }
  }, [loans])

  return (
    <div className="stack-lg">
      <div className="row-between">
        <h1>Your loans</h1>
        <Link className="button-link" to="/loans/new">
          + New loan
        </Link>
      </div>

      {error && <ErrorBanner message={error} offline={offline} />}

      {overview && (
        <section className="card overview">
          <div className="totals">
            <StatTile icon={<Layers />} label="Active loans" value={overview.activeCount} />
            <StatTile icon={<Coins />} label="Total to repay" value={money(overview.totalToRepay)} />
            <StatTile icon={<CheckCircle />} label="Paid so far" value={money(overview.totalPaid)} />
            <StatTile
              icon={<Wallet />}
              label="Remaining"
              value={money(overview.totalRemaining)}
              featured
            />
          </div>
        </section>
      )}

      {sorted && sorted.length > 1 && (
        <label className="sort-control">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="category">Category</option>
          </select>
        </label>
      )}

      {sorted === null && <p className="muted">Loading…</p>}

      {sorted !== null && sorted.length === 0 && !error && (
        <div className="card empty">
          <p>You don't have any loans yet.</p>
          <Link className="button-link" to="/loans/new">
            Add your first loan
          </Link>
        </div>
      )}

      {sorted && sorted.length > 0 && (
        <div className="loan-grid">
          {sorted.map((loan) => {
            const pct = loan.totalCount
              ? Math.round((loan.paidCount / loan.totalCount) * 100)
              : 0
            return (
              <Link key={loan.id} to={`/loans/${loan.id}`} className="card loan-card">
                <div className="row-between">
                  <h2>{loan.name}</h2>
                  <span className="apr-chip">{Number(loan.apr)}% APR</span>
                </div>
                <span className="category-chip">{loan.category}</span>
                <div className="loan-amounts">
                  <span className="big">{money(loan.totalRemaining)}</span>
                  <span className="muted"> remaining of {money(loan.totalAmount)}</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
                <p className="muted small">
                  {loan.paidCount} of {loan.totalCount} payments made
                </p>
                {loan.nextDueDate ? (
                  <p className="next-due">
                    Next: {money(loan.nextPaymentAmount ?? 0)} due {formatDate(loan.nextDueDate)}
                  </p>
                ) : (
                  <p className="next-due paid-off">Paid off 🎉</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
