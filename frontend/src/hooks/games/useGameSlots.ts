import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../config/axios'
import { useApiQuery } from '../useApiQuery'
import type { GameBooking, GameSlot, GameSlotRequest, GameSlotRequestSummary, GameSlotSummary } from '../../types/games'

export const useGameSlotsForDate = (gameId?: number, date?: string, enabled = true) =>
  useApiQuery<GameSlot[]>(
    ['games', gameId, 'slots', date ?? ''],
    gameId ? `/api/v1/games/${gameId}/slots` : '',
    date ? { date } : undefined,
    enabled && Boolean(gameId) && Boolean(date)
  )

export const useTodayGameSlots = (gameId?: number, enabled = true) =>
  useApiQuery<GameSlot[]>(
    ['games', gameId, 'slots', 'today'],
    gameId ? `/api/v1/games/${gameId}/slots/today` : '',
    undefined,
    enabled && Boolean(gameId)
  )

export const useUpcomingGameSlots = (gameId?: number, days = 7, enabled = true) =>
  useApiQuery<GameSlotSummary[]>(
    ['games', gameId, 'slots', 'upcoming', days],
    gameId ? `/api/v1/games/${gameId}/slots/upcoming` : '',
    { days },
    enabled && Boolean(gameId)
  )

export const useRequestGameSlot = () =>
  useMutation({
    mutationFn: async ({ gameId, slotId, participantIds }: { gameId: number; slotId: number; participantIds: number[] }) => {
      const response = await apiClient.post<GameSlotRequest>(
        `/api/v1/games/${gameId}/slots/${slotId}/requests`,
        { participantIds }
      )
      return response.data?.data ?? response.data
    }
  })

export const useCancelGameRequest = () =>
  useMutation({
    mutationFn: async (requestId: number) => {
      await apiClient.delete(`/api/v1/games/requests/${requestId}`)
    }
  })

export const useMyGameRequests = (days = 7, enabled = true) =>
  useApiQuery<GameSlotRequestSummary[]>(
    ['games', 'requests', 'me', days],
    '/api/v1/games/requests/me',
    { days },
    enabled
  )

export const useMyGameBookings = (days = 7, enabled = true) =>
  useApiQuery<GameBooking[]>(
    ['games', 'bookings', 'me', days],
    '/api/v1/games/bookings/me',
    { days },
    enabled
  )

export const useCancelGameBooking = () =>
  useMutation({
    mutationFn: async (bookingId: number) => {
      await apiClient.delete(`/api/v1/games/bookings/${bookingId}`)
    }
  })

export const useGenerateSlots = () =>
  useMutation({
    mutationFn: async ({ gameId, startDate, endDate }: { gameId: number; startDate: string; endDate: string }) => {
      const response = await apiClient.post<GameSlot[]>(
        `/api/v1/games/${gameId}/slots/generate`,
        undefined,
        { params: { startDate, endDate } }
      )
      return response.data?.data ?? response.data
    }
  })