export type UserProfile = {
  id: number
  fullName: string
  email: string
  phone: string
  dateOfBirth?: string | null
  dateOfJoining: string
  profilePhotoUrl?: string | null
  department?: string | null
  designation?: string | null
  manager?: string | null
  role?: string | null
}

export type UserProfileUpdatePayload = {
  fullName?: string | null
  phone?: string | null
  dateOfBirth?: string | null
  profilePhotoUrl?: string | null
  department?: string | null
  designation?: string | null
}