import { useApiQuery } from './useApiQuery'

export type RoleOption = {
  roleId: number
  name: string
  description?: string | null
}

export const usePublicRoles = () =>
  useApiQuery<RoleOption[]>(['roles', 'public'], '/api/v1/roles/public')