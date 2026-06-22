// Password rules, kept in sync with the backend's validation regex:
// 6+ chars, an uppercase letter, a number, and a special character.
export const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export const passwordValid = (p: string): boolean => PASSWORD_RULES.every((r) => r.test(p))
