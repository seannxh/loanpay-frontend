import type { InstallmentStatus } from '@/types'

export function StatusBadge({ status }: { status: InstallmentStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
}
