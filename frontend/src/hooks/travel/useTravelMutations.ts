import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import type { TravelAssigned } from '../../types/travel'
 
type TravelAssignmentInput = { employeeId: number }
 
export type CreateTravelPayload = {
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  createdById: number
  assignments: TravelAssignmentInput[]
}
 
export type UpdateTravelPayload = {
  travelId: number
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  assignedEmployeeIds?: number[]
}
 
export const useCreateTravel = () =>
  useMutation({
    mutationFn: async (payload: CreateTravelPayload) => {
      const response = await apiClient.post<TravelAssigned>('/api/v1/travels', payload)
      return response.data?.data ?? response.data
    }
  })
 
export const useUpdateTravel = () =>
  useMutation({
    mutationFn: async ({ travelId, ...payload }: UpdateTravelPayload) => {
      const response = await apiClient.put<TravelAssigned>(`/api/v1/travels/${travelId}`, payload)
      return response.data?.data ?? response.data
    }
  })
 
export const useDeleteTravel = () =>
  useMutation({
    mutationFn: async (travelId: number) => {
      await apiClient.delete(`/api/v1/travels/${travelId}`)
    }
  })
 