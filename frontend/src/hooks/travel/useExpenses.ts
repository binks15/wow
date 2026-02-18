import { useApiQuery } from '../useApiQuery'
import type { ExpenseItem } from '../../types/expense'

export type ExpenseFilters = {
  employeeId?: number
  travelId?: number
  from?: string
  to?: string
  status?: string
}

export const useMyExpenses = () =>
  useApiQuery<ExpenseItem[]>(['expenses', 'mine'], '/api/v1/expenses/my')

export const useHrExpenses = (filters: ExpenseFilters, enabled = true) =>
  useApiQuery<ExpenseItem[]>(['expenses', 'hr', filters], '/api/v1/expenses', filters, enabled)