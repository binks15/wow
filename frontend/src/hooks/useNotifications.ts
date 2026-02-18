import { useMutation } from '@tanstack/react-query'
import { useApiQuery } from './useApiQuery'
import { apiClient } from '../config/axios'
import type { NotificationItem } from '../types/notification'

export const useNotifications = () =>
  useApiQuery<NotificationItem[]>(['notifications'], '/api/v1/notifications')

export const useMarkNotification = () =>
  useMutation({
    mutationFn: async ({ notificationId, isRead }: { notificationId: number; isRead: boolean }) => {
      await apiClient.patch(`/api/v1/notifications/${notificationId}`, { isRead })
    }
  })