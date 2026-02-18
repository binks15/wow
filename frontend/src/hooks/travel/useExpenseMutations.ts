import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import type { ExpenseItem } from '../../types/expense'
 
type CreateExpensePayload = {
  assignId: number
  categoryId: number
  amount: number
  currency: string
  expenseDate: string
}
 
export const useCreateExpense = () =>
  useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const response = await apiClient.post<ExpenseItem>('/api/v1/expenses', payload)
      return response.data?.data ?? response.data
    }
  })
 
export const useUploadExpenseProof = () =>
  useMutation({
    mutationFn: async ({ expenseId, file }: { expenseId: number; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      await apiClient.post(`/api/v1/expenses/${expenseId}/proofs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
  })
 
export const useSubmitExpense = () =>
  useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await apiClient.post<ExpenseItem>(`/api/v1/expenses/${expenseId}/submit`)
      return response.data?.data  ?? response.data
    }
  })
 