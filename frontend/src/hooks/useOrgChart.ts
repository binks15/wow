import { useApiQuery } from './useApiQuery'
import type { OrgChartNode } from '../types/org-chart'

export const useOrgChart = (userId?: number, enabled = true) =>
  useApiQuery<OrgChartNode>(
    ['org-chart', userId ?? 'me'],
    `/api/v1/users/org-chart/${userId}`,
    undefined,
    enabled
  )