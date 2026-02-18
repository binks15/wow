import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import { useApiQuery } from '../useApiQuery'
import type { Game, GameCreatePayload, GameUpdatePayload } from '../../types/games'

export const useGames = () => useApiQuery<Game[]>(['games'], '/api/v1/games')

export const useCreateGame = () =>
  useMutation({
    mutationFn: async (payload: GameCreatePayload) => {
      const response = await apiClient.post<Game>('/api/v1/games', payload)
      return response.data?.data ?? response.data
    }
  })

export const useUpdateGame = () =>
  useMutation({
    mutationFn: async ({ gameId, ...payload }: GameUpdatePayload) => {
      const response = await apiClient.put<Game>(`/api/v1/games/${gameId}`, payload)
      return response.data?.data ?? response.data
    }
  })