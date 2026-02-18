import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import type { ExpenseItem } from '../../types/expense'

type ReviewPayload = {
  expenseId: number
  status: 'Approved' | 'Rejected'
  remarks?: string
}

export const useReviewExpense = () =>
  useMutation({
    mutationFn: async ({ expenseId, status, remarks }: ReviewPayload) => {
      const response = await apiClient.post<ExpenseItem>(`/api/v1/expenses/${expenseId}/review`, {
        status,
        remarks
      })
      return response.data?.data ?? response.data;
    }
  })