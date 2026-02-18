export type ExpenseProof = {
  proofId: number
  fileName: string
  filePath: string
  fileType?: string | null
  uploadedAt: string
}
 
export type ExpenseItem = {
  expenseId: number
  assignId?: number
  employeeId: number
  categoryId: number
  amount: number
  currency: string
  expenseDate: string
  status: string
  submittedAt?: string | null
  reviewedById?: number | null
  reviewedAt?: string | null
  remarks?: string | null
  proofs: ExpenseProof[]
}
 