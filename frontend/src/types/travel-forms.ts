export type TravelCreateFormValues = {
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  assignments: number[]
}

export type TravelFilterValues = {
  employeeId?: number
}

export type TravelEditFormValues = {
  travelName: string
  destination: string
  purpose?: string
  startDate: string
  endDate: string
  assignments?: number[]
}