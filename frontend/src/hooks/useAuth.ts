import { apiClient } from '../config/axios'
import { useAppDispatch, useAppSelector } from '../config/hooks'
import { queryClient } from '../config/queryClient'
import { clearTokens } from '../features/auth/authSlice'
import { parseJwt } from '../utils/jwt'

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const profile = parseJwt(auth.tokens?.accessToken)

  const logout = async () => {
    const accessToken = auth.tokens?.accessToken

    try {
      if (accessToken) {
        await apiClient.post('/api/v1/auth/logout', { accessToken })
      }
    } finally {
      queryClient.clear()
      dispatch(clearTokens())
    }
  }

  const userId = profile?.sub ? Number(profile.sub) : undefined
  return {
    ...auth,
    role: profile?.role ?? 'Employee',
    fullName: profile?.full_name ?? '',
    email: profile?.email ?? '',
    userId: Number.isNaN(userId) ? undefined : userId,
    logout
  }
}