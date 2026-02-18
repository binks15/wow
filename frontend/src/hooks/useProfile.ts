import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../config/axios'
import { useApiQuery } from './useApiQuery'
import type { UserProfile, UserProfileUpdatePayload } from '../types/user-profile'

export const useUserProfile = () =>
  useApiQuery<UserProfile>(['users', 'me'], '/api/v1/users/me')

export const useUpdateUserProfile = () =>
  useMutation({
    mutationFn: async (payload: UserProfileUpdatePayload) => {
      const response = await apiClient.put<UserProfile>('/api/v1/users/me', payload)
      return response.data?.data ?? response.data
    }
  })

export const useUploadProfileAvatar = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post<UserProfile>('/api/v1/users/me/avatar', formData)
      return response.data?.data ?? response.data
    }
  })