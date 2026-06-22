import type { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  icon?: ReactNode
  // Highlighted emerald-gradient tile (one per group, like the mockup).
  featured?: boolean
}

export function StatTile({ label, value, icon, featured }: Props) {
  return (
    <div className={featured ? 'stat-tile featured' : 'stat-tile'}>
      <span className="stat-tile-label">
        {icon}
        {label}
      </span>
      <span className="stat-tile-value">{value}</span>
    </div>
  )
}
