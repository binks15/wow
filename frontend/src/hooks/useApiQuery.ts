import { useQuery, type QueryKey } from '@tanstack/react-query'
import { apiClient } from '../config/axios'

export const useApiQuery = <TData>(
  queryKey: QueryKey,
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
  enabled = true
) =>
  useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<TData>(url, { params })
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    }
  })