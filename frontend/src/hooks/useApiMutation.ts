import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../config/axios'

type MutationOptions<TData> = {
  url: string
  method?: 'post' | 'put' | 'patch' | 'delete'
  onSuccess?: (data: TData) => void
  onError?: (error: unknown) => void
}

export const useApiMutation = <TData, TVariables>(options: MutationOptions<TData>) =>
  useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await apiClient.request<TData>({
        url: options.url,
        method: options.method ?? 'post',
        data: variables
      })
      return response.data?.data ?? response.data;
    },
    onSuccess: options.onSuccess,
    onError: options.onError
  })