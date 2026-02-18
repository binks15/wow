import { useApiQuery } from './useApiQuery'
import type { EmployeeOption } from '../types/employee'

export const useEmployeeSearch = (query: string, enabled: boolean) =>
  useApiQuery<EmployeeOption[]>(['employees', 'search', query], '/api/v1/users/search', { query }, enabled)