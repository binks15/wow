import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import type { TravelDocument } from '../../types/document'
 
type UploadPayload = {
  travelId: number
  employeeId?: number
  documentType: string
  file: File
}
 
type UpdatePayload = {
  documentId: number
  documentType?: string
  file?: File
}
 
export const useUploadTravelDocument = () =>
  useMutation({
    mutationFn: async ({ travelId, employeeId, documentType, file }: UploadPayload) => {
      const formData = new FormData()
      formData.append('travelId', String(travelId))
      if (employeeId) {
        formData.append('employeeId', String(employeeId))
      }
      formData.append('documentType', documentType)
      formData.append('file', file)
 
      const response = await apiClient.post<TravelDocument>('/api/v1/travel-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
 
      return response.data?.data ?? response.data
    }
  })
 
export const useUpdateTravelDocument = () =>
  useMutation({
    mutationFn: async ({ documentId, documentType, file }: UpdatePayload) => {
      const formData = new FormData()
      if (documentType) {
        formData.append('documentType', documentType)
      }
      if (file) {
        formData.append('file', file)
      }
 
      const response = await apiClient.put<TravelDocument>(`/api/v1/travel-documents/${documentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
 
      return response.data?.data ?? response.data
    }
  })
 
export const useDeleteTravelDocument = () =>
  useMutation({
    mutationFn: async (documentId: number) => {
      await apiClient.delete(`/api/v1/travel-documents/${documentId}`)
    }
  })
 