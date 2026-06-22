import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import { money, formatDate } from '@/lib/format'
import type { Installment } from '@/types'

interface Props {
  installments: Installment[]
  // When provided, a "Mark paid" action column is shown for payable rows.
  onMarkPaid?: (installment: Installment) => void
  updatingId?: string | null
}

const PAGE_SIZE = 10

// Shared repayment-schedule table used by both the new-loan preview and the
// loan-detail tracker. "Balance" is the remaining principal after that payment.
export function ScheduleTable({ installments, onMarkPaid, updatingId }: Props) {
  const showActions = !!onMarkPaid
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(installments.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = installments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="table-wrap">
      <table className="schedule">
        <thead>
          <tr>
            <th>#</th>
            <th>Due date</th>
            <th className="num">Payment</th>
            <th className="num">Principal</th>
            <th className="num">Interest</th>
            <th className="num">Balance</th>
            <th>Status</th>
            {showActions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {paged.map((inst) => {
            const payable = inst.status === 'PENDING' || inst.status === 'OVERDUE'
            return (
              <tr key={inst.id || inst.installmentNumber}>
                <td>{inst.installmentNumber}</td>
                <td>{formatDate(inst.dueDate)}</td>
                <td className="num">{money(inst.paymentAmount)}</td>
                <td className="num">{money(inst.principal)}</td>
                <td className="num">{money(inst.interest)}</td>
                <td className="num">{money(inst.remainingBalance)}</td>
                <td>
                  <StatusBadge status={inst.status} />
                </td>
                {showActions && (
                  <td>
                    {payable && (
                      <button
                        type="button"
                        className="mark-paid"
                        disabled={updatingId === inst.id}
                        onClick={() => onMarkPaid!(inst)}
                      >
                        {updatingId === inst.id ? 'Saving…' : 'Mark paid'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="row pagination">
          <button
            type="button"
            className="secondary"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span className="muted small">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="secondary"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
