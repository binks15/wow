import { useApiMutation } from './useApiMutation'
import type { AuthResponse, LoginPayload } from '../features/auth/authTypes'
import { useAppDispatch } from '../config/hooks'
import { setTokens } from '../features/auth/authSlice'

export const useLogin = () => {
  const dispatch = useAppDispatch()

  return useApiMutation<AuthResponse, LoginPayload>({
    url: '/api/v1/auth/login',
    method: 'post',
    onSuccess: (data:any) => {
      dispatch(setTokens(data))
    }
  })
}