import { useState } from 'react'
import { Header } from '../../components/Header'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Select'
import { useQueryClient } from '@tanstack/react-query'
import { useMyGameRequests, useCancelGameRequest } from '../../hooks/games/useGameSlots'
import { useAuth } from '../../hooks/useAuth'

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })

const statusStyles: Record<string, string> = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Waitlisted: 'border-slate-200 bg-slate-100 text-slate-600',
  Assigned: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
  Rejected: 'border-red-200 bg-red-50 text-red-700'
}

const canCancel = (status: string) => ['Pending', 'Waitlisted', 'Assigned'].includes(status)

type RequestParticipant = { id: number; fullName: string }
type GameRequestItem = {
  requestId: number
  gameName: string
  startTime: string
  endTime: string
  requestedAt: string
  status: string
  requestedBy: number
  participants: RequestParticipant[]
}

export const GameRequestsPage = () => {
  const [days, setDays] = useState(7)
  const requestsQuery = useMyGameRequests(days, true)
  const cancelRequest = useCancelGameRequest()
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return (
    <section className="space-y-6">
      <Header
        title="My Game Slot Requests"
        description={`Requests for slots in the next ${days} days.`}
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

      {requestsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading requests...
        </div>
      ) : null}

      {requestsQuery.isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load requests right now.</p>
        </Card>
      ) : null}

      {!requestsQuery.isLoading && (requestsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title="No active requests" description="Request a slot to see it here." />
      ) : null}

      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(300px,360px))] justify-center sm:justify-start">
        {(requestsQuery.data as GameRequestItem[] | undefined)?.map((request) => (
          <Card key={request.requestId} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{request.gameName}</h3>
                <p className="text-sm text-slate-500">
                  {formatDateTime(request.startTime)} → {formatDateTime(request.endTime)}
                </p>
                <p className="text-xs text-slate-500">Requested at {formatDateTime(request.requestedAt)}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[request.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {request.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {request.participants.map((participant: RequestParticipant) => (
                <span key={participant.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {participant.fullName}
                </span>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="dark"
                disabled={cancelRequest.isPending || !canCancel(request.status) || request.requestedBy !== userId}
                onClick={async () => {
                  await cancelRequest.mutateAsync(request.requestId)
                  await queryClient.invalidateQueries({ queryKey: ['games', 'requests', 'me', days] })
                  await queryClient.invalidateQueries({ queryKey: ['games', 'bookings', 'me'] })
                }}
              >
                {cancelRequest.isPending ? 'Cancelling...' : 'Cancel request'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}