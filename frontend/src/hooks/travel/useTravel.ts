import { useApiQuery } from '../useApiQuery'
import type { EmployeeOption } from '../../types/employee'
import type { TravelAssigned, TravelAssignment, TravelDetail } from '../../types/travel'

export const useAssignedTravels = (employeeId?: number, enabled = true) =>
  useApiQuery<TravelAssigned[]>(
    ['travels', 'assigned', employeeId ?? 'self'],
    '/api/v1/travels/assignments',
    employeeId ? { employeeId } : undefined,
    enabled
  )

  //testing
export const useTravelAssignments = (employeeId?: number, enabled = true) =>
  useApiQuery<TravelAssignment[]>(
    ['travels', 'assignments', employeeId ?? 'self'],
    '/api/v1/travels/assignments',
    employeeId ? { employeeId } : undefined,
    enabled
  )

export const useTravelById = (travelId?: number, enabled = true) =>
  useApiQuery<TravelDetail>(
    ['travels', 'detail', travelId ?? 'none'],
    travelId ? `/api/v1/travels/${travelId}` : '/api/v1/travels/0',
    undefined,
    enabled && Boolean(travelId)
  )

export const useCreatedTravels = (enabled = true) =>
  useApiQuery<TravelAssigned[]>(['travels', 'created'], '/api/v1/travels/created', undefined, enabled)

export const useTravelAssignees = (travelId?: number, enabled = true) =>
  useApiQuery<EmployeeOption[]>(
    ['travels', 'assignees', travelId ?? 'none'],
    travelId ? `/api/v1/travels/${travelId}/assignees` : '/api/v1/travels/0/assignees',
    undefined,
    enabled && Boolean(travelId)
  )