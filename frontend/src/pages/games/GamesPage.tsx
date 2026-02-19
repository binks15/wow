import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { AsyncSearchableMultiSelect } from '../../components/ui/AsyncSearchableMultiSelect '
import { useGames } from '../../hooks/games/useGames'
import { useTodayGameSlots, useRequestGameSlot } from '../../hooks/games/useGameSlots'
import { useGameInterests } from '../../hooks/games/useGameInterests'
import { useEmployeeSearch } from '../../hooks/useEmployeeSearch'
import { useAuth } from '../../hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import type { Game, GameInterest, GameSlot } from '../../types/games'
import type { OrgChartUser } from '../../types/org-chart'

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const statusStyles: Record<string, string> = {
  Open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Locked: 'border-amber-200 bg-amber-50 text-amber-700',
  Booked: 'border-slate-200 bg-slate-100 text-slate-600',
  Cancelled: 'border-red-200 bg-red-50 text-red-700'
}

export const GamesPage = () => {
  const navigate = useNavigate()
  const gamesQuery = useGames()
  const interestsQuery = useGameInterests()
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(undefined)
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(undefined)
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success')
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()
  const slotsQuery = useTodayGameSlots(selectedGameId, Boolean(selectedGameId))
  const requestSlot = useRequestGameSlot()
  const empSearch = useEmployeeSearch(searchQuery, searchQuery.length >= 2)
  const { userId } = useAuth()

  const interestedGameIds = new Set(
    (interestsQuery.data ?? [])
      .filter((item: GameInterest) => item.isInterested)
      .map((item: GameInterest) => item.gameId)
  )

  const availableGames = (gamesQuery.data ?? []).filter((game: Game) =>
    interestedGameIds.has(game.gameId)
  )

  useEffect(() => {
    if (!availableGames.length) {
      setSelectedGameId(undefined)
      return
    }

    const hasValidSelection = availableGames.some((game: Game) => game.gameId === selectedGameId)
    if (!hasValidSelection) {
      setSelectedGameId(availableGames[0].gameId)
    }
  }, [availableGames, selectedGameId])

  useEffect(() => {
    setSelectedSlotId(undefined)
    setParticipantIds([])
    setMessage('')
    setMessageTone('success')
  }, [selectedGameId])

  useEffect(() => {
    if (userId) {
      setParticipantIds([userId])
    }
  }, [userId])

  const selectedGame = availableGames.find((game: Game) => game.gameId === selectedGameId)
  const maxPlayersPerSlot = selectedGame?.maxPlayersPerSlot ?? 0
  const isInterested = (interestsQuery.data ?? []).find((item: GameInterest) => item.gameId === selectedGameId)?.isInterested

  const slotOptions = (slotsQuery.data ?? []).map((slot: GameSlot) => ({
    id: slot.slotId,
    label: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)} (${slot.status})`
  }))

  const employeeOptions = (empSearch.data ?? []).map((employee: OrgChartUser) => ({
    value: employee.id,
    label: `${employee.fullName} (${employee.email})`
  }))

  const onRequest = async () => {
    if (!selectedGameId || !selectedSlotId) {
      setMessage('Select a slot to request.')
      setMessageTone('error')
      return
    }

    const requestParticipantIds = userId && !participantIds.includes(userId)
      ? [userId, ...participantIds]
      : participantIds

    if (maxPlayersPerSlot > 0 && requestParticipantIds.length > maxPlayersPerSlot) {
      const maxOthers = Math.max(0, maxPlayersPerSlot - 1)
      setMessage(`You can add at most ${maxOthers} other employees.`)
      setMessageTone('error')
      return
    }

    setMessage('')
    try {
      await requestSlot.mutateAsync({
        gameId: selectedGameId,
        slotId: selectedSlotId,
        participantIds: requestParticipantIds
      })
      await queryClient.invalidateQueries({ queryKey: ['games', selectedGameId, 'slots', 'today'] })
      setMessage('Request submitted. Allocation happens 1 hour before start.')
      setMessageTone('success')
      setSelectedSlotId(undefined)
      setParticipantIds([])
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data as { error?: string; message?: string } | undefined)?.error ||
          (error.response?.data as { error?: string; message?: string } | undefined)?.message
        : undefined
      setMessage(apiMessage || 'Unable to request this slot right now.')
      setMessageTone('error')
    }
  }

  return (
    <section className="space-y-6">
      <Header
        title="Games"
        description="Pick a game, see today's slots, and request a time that works for you."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => navigate('/games/requests')}>
              My requests
            </Button>
            <Button type="button" onClick={() => navigate('/games/upcoming')}>
              Upcoming bookings
            </Button>
          </div>
        }
      />

      <Card className="space-y-4">
        {gamesQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner /> Loading games...
          </div>
        ) : null}

        {gamesQuery.isError ? (
          <p className="text-sm text-red-600">Unable to load games right now.</p>
        ) : null}

        {availableGames.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Select a game"
              value={selectedGameId ?? ''}
              onChange={(event) => setSelectedGameId(Number(event.target.value))}
            >
              <option value="" disabled>
                Choose a game
              </option>
              {availableGames.map((game: Game) => (
                <option key={game.gameId} value={game.gameId}>
                  {game.gameName}
                </option>
              ))}
            </Select>
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Game configuration</p>
              {selectedGame ? (
                <ul className="mt-2 space-y-1 text-xs">
                  <li>Operating: {selectedGame.operatingHoursStart} - {selectedGame.operatingHoursEnd}</li>
                  <li>Slot duration: {selectedGame.slotDurationMinutes} minutes</li>
                  <li>Max players: {selectedGame.maxPlayersPerSlot}</li>
                </ul>
              ) : (
                <p className="mt-2">Select a game to view settings.</p>
              )}
            </div>
          </div>
        ) : !gamesQuery.isLoading && !gamesQuery.isError ? (
          <EmptyState
            title="No interested games"
            description="Add game interests in your profile to request slots."
          />
        ) : null}
      </Card>

      {selectedGameId ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Today's slots</h3>
              <p className="text-sm text-slate-500">Only open slots can be requested. Allocation happens 1 hour before start.</p>
            </div>
            {!isInterested ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                Add this game in Profile → Interests to request slots.
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">Unavailable slots are disabled and cannot be selected.</p>

          {slotsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spinner /> Loading slots...
            </div>
          ) : null}

          {!slotsQuery.isLoading && !slotOptions.length ? (
            <EmptyState
              title="No slots today"
              description="Ask HR/Manager to generate slots for this game."
            />
          ) : null}

          {slotOptions.length ? (
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(260px,320px))] justify-center sm:justify-start">
              {(slotsQuery.data ?? []).map((slot: GameSlot) => (
                <button
                  key={slot.slotId}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedSlotId === slot.slotId
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-200'
                  }`}
                  onClick={() => slot.status === 'Open' && setSelectedSlotId(slot.slotId)}
                  disabled={slot.status !== 'Open'}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </p>
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusStyles[slot.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                      {slot.status}
                    </span>
                  </div>
                  {slot.status !== 'Open' ? (
                    <p className="mt-2 text-xs text-slate-500">This slot is not available for requests.</p>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Request this slot</h4>
            <p className="text-xs text-slate-500">
              Add up to {Math.max(0, maxPlayersPerSlot - 1)} other employees. All must be interested.
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <AsyncSearchableMultiSelect
                label="Add participants"
                options={employeeOptions}
                value={participantIds}
                onChange={setParticipantIds}
                onSearch={setSearchQuery}
                isLoading={empSearch.isLoading}
                placeholder="Search teammates"
              />
              <div className="flex flex-col justify-end gap-2">
                <Button
                  type="button"
                  disabled={!isInterested || !selectedSlotId || requestSlot.isPending}
                  onClick={onRequest}
                >
                  {requestSlot.isPending ? 'Submitting...' : 'Request slot'}
                </Button>
                {message ? (
                  <p className={`text-xs ${messageTone === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </section>
  )
}