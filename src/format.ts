import type { Money } from './types'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

export function money(value: Money): string {
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? currency.format(n) : String(value)
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
}
