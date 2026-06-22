import { PASSWORD_RULES } from '../password'

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="pw-rules">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password)
        return (
          <li key={r.label} className={ok ? 'ok' : ''}>
            {ok ? '✓' : '○'} {r.label}
          </li>
        )
      })}
    </ul>
  )
}
