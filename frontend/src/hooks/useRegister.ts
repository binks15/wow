import { useApiMutation } from './useApiMutation'

type RegisterPayload = {
  email: string
  password: string
  fullName: string
  roleId: number
}

type RegisterResponse = {
  id: number
  email: string
  fullName: string
  role: string
}

export const useRegister = () =>
  useApiMutation<RegisterResponse, RegisterPayload>({
    url: '/api/v1/auth/register',
    method: 'post'
  })