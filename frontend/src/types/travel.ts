export type TravelAssigned = {
  travelId: number
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  assignedEmployeeIds?: number[]
}

export type TravelAssignment = {
  assignId: number
  travelId: number
  travelName: string
  destination?: string
  purpose?: string
  startDate: string
  endDate: string
  assignedEmployeeIds?: number[]
}

export type TravelDetail = {
  travelId: number
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  createdById: number
  assignedEmployeeIds: number[]
}