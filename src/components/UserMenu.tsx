import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Chevron, Moon, Sun } from './icons'

export function UserMenu() {
  const { username, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Close when navigating (adjusted during render per
  // https://react.dev/learn/you-might-not-need-an-effect).
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setOpen(false)
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        @{username}
        <Chevron size={15} />
      </button>

      {open && (
        <div className="user-menu-panel" role="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/account')}>
            Account
          </button>

          <button type="button" className="menu-item theme-row" onClick={toggleTheme}>
            <span>Theme</span>
            <span className="theme-switch">
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          <div className="menu-divider" />

          <button type="button" className="menu-item danger" onClick={logout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
