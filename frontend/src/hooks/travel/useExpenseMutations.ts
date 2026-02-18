import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import type { ExpenseItem } from '../../types/expense'
 
type CreateDraftPayload = {
  assignId: number
  categoryId: number
  amount: number
  currency: string
  expenseDate: string
}
 
type UpdateDraftPayload = {
  expenseId: number
  categoryId: number
  amount: number
  currency: string
  expenseDate: string
}
 
export const useCreateExpenseDraft = () =>
  useMutation({
    mutationFn: async (payload: CreateDraftPayload) => {
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
 
export const useUpdateExpenseDraft = () =>
  useMutation({
    mutationFn: async ({ expenseId, ...payload }: UpdateDraftPayload) => {
      const response = await apiClient.put<ExpenseItem>(`/api/v1/expenses/${expenseId}`, payload)
      return response.data?.data ?? response.data
    }
  })
 
export const useDeleteExpenseDraft = () =>
  useMutation({
    mutationFn: async (expenseId: number) => {
      await apiClient.delete(`/api/v1/expenses/${expenseId}`)
    }
  })
 
export const useDeleteExpenseProof = () =>
  useMutation({
    mutationFn: async ({ expenseId, proofId }: { expenseId: number; proofId: number }) => {
      await apiClient.delete(`/api/v1/expenses/${expenseId}/proofs/${proofId}`)
    }
  })
 