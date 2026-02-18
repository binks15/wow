import type { EmployeeOption } from './employee'

export type Game = {
  gameId: number
  gameName: string
  operatingHoursStart: string
  operatingHoursEnd: string
  slotDurationMinutes: number
  maxPlayersPerSlot: number
}

export type GameInterest = {
  gameId: number
  gameName: string
  isInterested: boolean
}

export type GameSlot = {
  slotId: number
  gameId: number
  startTime: string
  endTime: string
  status: 'Open' | 'Locked' | 'Booked' | 'Cancelled'
}

export type GameSlotSummary = {
  slotId: number
  gameId: number
  startTime: string
  endTime: string
  status: 'Open' | 'Locked' | 'Booked' | 'Cancelled'
  participants: EmployeeOption[]
}

export type GameSlotRequest = {
  requestId: number
  slotId: number
  requestedBy: number
  status: 'Pending' | 'Assigned' | 'Waitlisted' | 'Cancelled' | 'Rejected'
  requestedAt: string
  participantIds: number[]
}

export type GameSlotRequestSummary = {
  requestId: number
  gameId: number
  gameName: string
  slotId: number
  startTime: string
  endTime: string
  status: 'Pending' | 'Assigned' | 'Waitlisted' | 'Cancelled' | 'Rejected'
  requestedAt: string
  requestedBy: number
  participants: EmployeeOption[]
}

export type GameBooking = {
  bookingId: number
  gameId: number
  gameName: string
  slotId: number
  startTime: string
  endTime: string
  status: 'Booked' | 'Completed' | 'Cancelled'
  participants: EmployeeOption[]
}

export type GameCreatePayload = {
  gameName: string
  operatingHoursStart: string
  operatingHoursEnd: string
  slotDurationMinutes: number
  maxPlayersPerSlot: number
}

export type GameUpdatePayload = GameCreatePayload & { gameId: number }