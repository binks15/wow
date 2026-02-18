import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import { useApiQuery } from '../useApiQuery'
import type { GameInterest } from '../../types/games'

export const useGameInterests = () =>
  useApiQuery<GameInterest[]>(['games', 'interests'], '/api/v1/games/interests/me')

export const useUpdateGameInterests = () =>
  useMutation({
    mutationFn: async (gameIds: number[]) => {
      const response = await apiClient.put<GameInterest[]>('/api/v1/games/interests/me', { gameIds })
      return response.data?.data ?? response.data
    }
  })