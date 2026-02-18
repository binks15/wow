import { useApiQuery } from '../useApiQuery'
import type {  TeamMember } from '../../types/manager'

export const useTeamMembers = () =>
  useApiQuery<TeamMember[]>(['manager', 'team-members'], '/api/v1/manager/team-members')

