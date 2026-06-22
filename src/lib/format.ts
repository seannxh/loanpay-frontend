import type { Money } from '@/types'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

export function money(value: Money): string {
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? currency.format(n) : String(value)
}

export function formatDate(iso: string): string {
  // Parse the y/m/d components and build a local-time Date directly, rather
  // than `new Date(iso)`. Date-only ISO strings parse as UTC midnight per
  // spec, which toLocaleDateString then renders as the previous day in any
  // timezone behind UTC (e.g. all of the Americas) — a classic off-by-one bug.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const [, year, month, day] = match
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
}
