export type JwtPayload = {
  sub?: string
  email?: string
  role?: string
  full_name?: string
  exp?: number
}

const normalizeBase64 = (value: string) => {
  const base = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base.length % 4
  if (!pad) {
    return base
  }
  return base + '='.repeat(4 - pad)
}

export const parseJwt = (token?: string | null): JwtPayload | null => {
  if (!token) {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  try {
    const payload = atob(normalizeBase64(parts[1]))
    return JSON.parse(payload) as JwtPayload
  } catch {
    return null
  }
}