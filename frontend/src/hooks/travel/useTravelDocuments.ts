import { useApiQuery } from '../useApiQuery'
import type { TravelDocument } from '../../types/document'

export type TravelDocumentFilters = {
  travelId?: number
  employeeId?: number
}

export const useTravelDocuments = (filters: TravelDocumentFilters) =>
  useApiQuery<TravelDocument[]>(['travel-documents', filters], '/api/v1/travel-documents', filters)