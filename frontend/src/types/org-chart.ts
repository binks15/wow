export type OrgChartNode = {
  id: number
  fullName: string
  email: string
  department?: string | null
  designation?: string | null
  profilePhotoUrl?: string | null
  managerId?: number | null
  directReports: OrgChartNode[]
}

export type OrgChartUser = {
  id: number
  fullName: string
  email: string
  department?: string | null
  designation?: string | null
  profilePhotoUrl?: string | null
  managerId?: number | null
}