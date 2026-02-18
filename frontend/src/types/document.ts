export type TravelDocument = {
  documentId: number
  travelId: number
  employeeId?: number | null
  uploadedById: number
  uploadedByName?: string | null
  ownerType: string
  documentType: string
  fileName: string
  filePath: string
  uploadedAt: string
}
 