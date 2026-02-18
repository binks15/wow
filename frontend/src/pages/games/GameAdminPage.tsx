import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Header } from '../../components/Header'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { useGames, useCreateGame, useUpdateGame } from '../../hooks/games/useGames'
import { useGenerateSlots } from '../../hooks/games/useGameSlots'
import { useQueryClient } from '@tanstack/react-query'
import { toDateInputValue } from '../../utils/format'
import type { Game, GameCreatePayload } from '../../types/games'

type GameFormValues = GameCreatePayload & {
  generateStartDate?: string
  generateEndDate?: string
}

export const GameAdminPage = () => {
  const gamesQuery = useGames()
  const createGame = useCreateGame()
  const updateGame = useUpdateGame()
  const generateSlots = useGenerateSlots()
  const queryClient = useQueryClient()
  const [editingGameId, setEditingGameId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const form = useForm<GameFormValues>({
    defaultValues: {
      gameName: '',
      operatingHoursStart: '09:00',
      operatingHoursEnd: '18:00',
      slotDurationMinutes: 30,
      maxPlayersPerSlot: 2,
      generateStartDate: '',
      generateEndDate: ''
    }
  })

  useEffect(() => {
    if (!editingGameId || !gamesQuery.data) {
      return
    }

    const game = (gamesQuery.data ?? []).find((item: Game) => item.gameId === editingGameId)
    if (!game) {
      return
    }

    form.reset({
      gameName: game.gameName,
      operatingHoursStart: game.operatingHoursStart,
      operatingHoursEnd: game.operatingHoursEnd,
      slotDurationMinutes: game.slotDurationMinutes,
      maxPlayersPerSlot: game.maxPlayersPerSlot,
      generateStartDate: toDateInputValue(new Date().toISOString()),
      generateEndDate: toDateInputValue(new Date().toISOString())
    })
  }, [editingGameId, form, gamesQuery.data])

  const onSubmit = async (values: GameFormValues) => {
    setMessage('')
    const payload = {
      gameName: values.gameName,
      operatingHoursStart: values.operatingHoursStart,
      operatingHoursEnd: values.operatingHoursEnd,
      slotDurationMinutes: Number(values.slotDurationMinutes),
      maxPlayersPerSlot: Number(values.maxPlayersPerSlot)
    }

    if (editingGameId) {
      await updateGame.mutateAsync({ ...payload, gameId: editingGameId })
      setMessage('Game updated successfully.')
    } else {
      await createGame.mutateAsync(payload)
      setMessage('Game created successfully.')
    }

    await queryClient.invalidateQueries({ queryKey: ['games'] })
  }

  const onGenerateSlots = async () => {
    if (!editingGameId) {
      setMessage('Select a game to generate slots.')
      return
    }

    const startDate = form.getValues('generateStartDate')
    const endDate = form.getValues('generateEndDate')
    if (!startDate || !endDate) {
      setMessage('Pick a start and end date to generate slots.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setMessage('Generate start date must be on or before end date.')
      return
    }

    await generateSlots.mutateAsync({ gameId: editingGameId, startDate, endDate })
    setMessage('Slots generated successfully.')
  }

  return (
    <section className="space-y-6">
      <Header title="Games Admin" description="Manage game configurations and generate slots." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Game configuration</h3>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <Input
              label="Game name"
              error={form.formState.errors.gameName?.message}
              {...form.register('gameName', {
                required: 'Game name is required.',
                validate: (value) => value.trim().length > 0 || 'Game name is required.'
              })}
            />
            <Input
              label="Operating start"
              type="time"
              error={form.formState.errors.operatingHoursStart?.message}
              {...form.register('operatingHoursStart', { required: 'Operating start is required.' })}
            />
            <Input
              label="Operating end"
              type="time"
              error={form.formState.errors.operatingHoursEnd?.message}
              {...form.register('operatingHoursEnd', {
                required: 'Operating end is required.',
                validate: (value) => {
                  const start = form.getValues('operatingHoursStart')
                  if (!start || !value) {
                    return true
                  }
                  return value > start || 'Operating end must be later than operating start.'
                }
              })}
            />
            <Input
              label="Slot duration (minutes)"
              type="number"
              error={form.formState.errors.slotDurationMinutes?.message}
              {...form.register('slotDurationMinutes', {
                valueAsNumber: true,
                required: 'Slot duration is required.',
                min: { value: 5, message: 'Slot duration must be at least 5 minutes.' }
              })}
            />
            <Input
              label="Max players per slot"
              type="number"
              error={form.formState.errors.maxPlayersPerSlot?.message}
              {...form.register('maxPlayersPerSlot', {
                valueAsNumber: true,
                required: 'Max players is required.',
                min: { value: 1, message: 'Max players must be at least 1.' }
              })}
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={createGame.isPending || updateGame.isPending}>
                {editingGameId ? 'Update game' : 'Create game'}
              </Button>
              <Button
                type="button"
                variant="dark"
                className="ml-2"
                onClick={() => {
                  setEditingGameId(null)
                  form.reset({
                    gameName: '',
                    operatingHoursStart: '09:00',
                    operatingHoursEnd: '18:00',
                    slotDurationMinutes: 30,
                    maxPlayersPerSlot: 2,
                    generateStartDate: '',
                    generateEndDate: ''
                  })
                }}
              >
                New game
              </Button>
            </div>
          </form>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Generate slots</h4>
            <p className="text-xs text-slate-500">Generate slots for a date range using the selected game settings.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input
                label="Start date"
                type="date"
                error={form.formState.errors.generateStartDate?.message}
                {...form.register('generateStartDate', { required: 'Start date is required.' })}
              />
              <Input
                label="End date"
                type="date"
                error={form.formState.errors.generateEndDate?.message}
                {...form.register('generateEndDate', {
                  required: 'End date is required.',
                  validate: (value) => {
                    const start = form.getValues('generateStartDate')
                    if (!start || !value) {
                      return true
                    }
                    return new Date(value) >= new Date(start)
                      ? true
                      : 'End date must be on or after start date.'
                  }
                })}
              />
            </div>
            <div className="mt-3">
              <Button type="button" onClick={onGenerateSlots} disabled={generateSlots.isPending}>
                {generateSlots.isPending ? 'Generating...' : 'Generate slots'}
              </Button>
            </div>
          </div>

          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Existing games</h3>
          {gamesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spinner /> Loading games...
            </div>
          ) : null}

          {gamesQuery.isError ? (
            <p className="text-sm text-red-600">Unable to load games.</p>
          ) : null}

          {!gamesQuery.isLoading && !gamesQuery.data?.length ? (
            <EmptyState title="No games yet" description="Create a game to get started." />
          ) : null}

          <div className="space-y-3">
            {(gamesQuery.data ?? []).map((game: Game) => (
              <button
                key={game.gameId}
                type="button"
                className={`w-full rounded-xl border p-3 text-left transition ${
                  editingGameId === game.gameId
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-200'
                }`}
                onClick={() => setEditingGameId(game.gameId)}
              >
                <p className="text-sm font-semibold text-slate-900">{game.gameName}</p>
                <p className="text-xs text-slate-500">
                  {game.operatingHoursStart} - {game.operatingHoursEnd} · {game.slotDurationMinutes} min · {game.maxPlayersPerSlot} players
                </p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}