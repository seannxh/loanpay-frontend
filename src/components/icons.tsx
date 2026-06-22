// Lightweight inline SVG icons (no dependency). All inherit `currentColor`
// and take an optional size; default stroke style matches the mockup.
interface IconProps {
  size?: number
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export function LogoMark({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" stroke="#fff" strokeWidth="1.6" />
      <path d="M6.5 10.5h11" stroke="#fff" strokeWidth="1.6" />
      <circle cx="9.2" cy="14" r="1" fill="#fff" />
    </svg>
  )
}

export function Sun({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

export function Moon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

export function Chevron({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function Calculator({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h4M8 18h.01M12 18h.01" />
    </svg>
  )
}

export function Coins({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.1 6.4a6 6 0 1 1-5.7 9.9" />
    </svg>
  )
}

export function Wallet({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M16 13h.01" />
    </svg>
  )
}

export function ChartDown({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M3 4v16h18" />
      <path d="M7 8l4 4 3-2 4 4" />
    </svg>
  )
}

export function Calendar({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  )
}

export function CheckCircle({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  )
}

export function Layers({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden="true">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  )
}
