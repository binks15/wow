import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type GuardProps = {
  children: ReactNode
}

type RoleGuardProps = GuardProps & {
  allowedRoles: string[]
}

export const ProtectedRoute = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export const GuestRoute = ({ children }: GuardProps) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const RoleRoute = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role } = useAuth()
  const location = useLocation()
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace state={{ from: location }} />
  }

  return <>{children}</>
}