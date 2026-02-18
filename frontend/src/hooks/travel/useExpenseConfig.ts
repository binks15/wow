import { useApiQuery } from '../useApiQuery'
import type { ExpenseCategory } from '../../types/expense-config'

export const useExpenseCategories = () =>
  useApiQuery<ExpenseCategory[]>(['expense-config', 'categories'], '/api/v1/expense-config/categories')