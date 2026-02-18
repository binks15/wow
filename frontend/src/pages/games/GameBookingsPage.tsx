import { useState } from 'react'
import { Header } from '../../components/Header'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Select'
import { useQueryClient } from '@tanstack/react-query'
import { useGames } from '../../hooks/games/useGames'
import { useMyGameBookings, useCancelGameBooking, useUpcomingGameSlots } from '../../hooks/games/useGameSlots'
import type { Game, GameSlotSummary } from '../../types/games'

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

const slotStatusStyles: Record<string, string> = {
  Open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Locked: 'border-amber-200 bg-amber-50 text-amber-700',
  Booked: 'border-slate-200 bg-slate-100 text-slate-600',
  Cancelled: 'border-red-200 bg-red-50 text-red-700'
}

type GameUpcomingCardProps = {
  game: Game
  days: number
}

type BookingParticipant = { id: number; fullName: string }
type BookingItem = {
  bookingId: number
  gameName: string
  startTime: string
  endTime: string
  status: string
  participants: BookingParticipant[]
}

const GameUpcomingCard = ({ game, days }: GameUpcomingCardProps) => {
  const slotsQuery = useUpcomingGameSlots(game.gameId, days, true)
  const now = new Date()
  const sortedSlots = [...(slotsQuery.data ?? [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const currentSlot = sortedSlots.find((slot) => {
    const start = new Date(slot.startTime)
    const end = new Date(slot.endTime)
    return start <= now && end > now
  })

  const nextSlot = sortedSlots.find((slot) => new Date(slot.startTime) > now)

  const renderSlot = (label: string, slot?: GameSlotSummary) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {slot ? (
          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${slotStatusStyles[slot.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
          >
            {slot.status}
          </span>
        ) : null}
      </div>
      {slot ? (
        <>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(slot.startTime)} → {formatDateTime(slot.endTime)}
          </p>
          {slot.participants.length ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              {slot.participants.map((participant) => (
                <span key={participant.id} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {participant.fullName}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No players assigned yet.</p>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs text-slate-500">No slot scheduled.</p>
      )}
    </div>
  )

  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900">{game.gameName}</h3>
        <p className="text-xs text-slate-500">Live lineup for the next {days} days.</p>
      </div>

      {slotsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading slots...
        </div>
      ) : null}

      {slotsQuery.isError ? (
        <p className="text-sm text-red-600">Unable to load slots right now.</p>
      ) : null}

      {!slotsQuery.isLoading && sortedSlots.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming slots available.</p>
      ) : null}

      {!slotsQuery.isLoading && sortedSlots.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {renderSlot('Current slot', currentSlot)}
          {renderSlot('Next slot', nextSlot)}
        </div>
      ) : null}
    </Card>
  )
}

export const GameBookingsPage = () => {
  const [days, setDays] = useState(7)
  const gamesQuery = useGames()
  const bookingsQuery = useMyGameBookings(days, true)
  const cancelBooking = useCancelGameBooking()
  const queryClient = useQueryClient()

  return (
    <section className="space-y-6">
      <Header
        title="Upcoming Game Bookings"
        description={`Your upcoming game slots for the next ${days} days.`}
        action={
          <Select
            label="Range"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </Select>
        }
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upcoming game show</h2>
          <p className="text-sm text-slate-500">See who is playing now and who is up next.</p>
        </div>

        {gamesQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner /> Loading games...
          </div>
        ) : null}

        {gamesQuery.isError ? (
          <p className="text-sm text-red-600">Unable to load games right now.</p>
        ) : null}

        {!gamesQuery.isLoading && (gamesQuery.data?.length ?? 0) === 0 ? (
          <EmptyState title="No games available" description="Ask HR/Manager to create games." />
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          {(gamesQuery.data as Game[] | undefined)?.map((game) => (
            <GameUpcomingCard key={game.gameId} game={game} days={days} />
          ))}
        </div>
      </Card>

      {bookingsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading bookings...
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load bookings right now.</p>
        </Card>
      ) : null}

      {!bookingsQuery.isLoading && (bookingsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title="No upcoming bookings" description="Request a slot to see it here." />
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {(bookingsQuery.data as BookingItem[] | undefined)?.map((booking) => (
          <Card key={booking.bookingId} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{booking.gameName}</h3>
                <p className="text-sm text-slate-500">
                  {formatDateTime(booking.startTime)} → {formatDateTime(booking.endTime)}
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {booking.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {booking.participants.map((participant: BookingParticipant) => (
                <span key={participant.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {participant.fullName}
                </span>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="dark"
                disabled={cancelBooking.isPending}
                onClick={async () => {
                  await cancelBooking.mutateAsync(booking.bookingId)
                  await queryClient.invalidateQueries({ queryKey: ['games', 'bookings', 'me', days] })
                }}
              >
                {cancelBooking.isPending ? 'Cancelling...' : 'Cancel booking'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}