import { useEffect } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { AsyncSearchableMultiSelect } from '../ui/AsyncSearchableMultiSelect '
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Spinner } from '../ui/Spinner'
import { formatDate } from '../../utils/format'
import type { EmployeeOption } from '../../types/employee'
import type { TravelAssigned } from '../../types/travel'
import type { TravelEditFormValues } from '../../types/travel-forms'

interface TravelListProps {
  travels: TravelAssigned[]
  isHr: boolean
  badgeLabel?: string
  editingTravelId: number | null
  editForm: UseFormReturn<TravelEditFormValues>
  onEditStart: (travelId: number) => void
  onUpdate: (values: TravelEditFormValues) => void
  onDelete: (travelId: number) => void
  onCancelEdit: () => void
  onViewDocuments: (travelId: number) => void
  onViewExpenses: (travelId: number) => void
  isUpdating: boolean
  employeeOptions: EmployeeOption[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
  isEditLoading: boolean
}

export const TravelList = ({
  travels,
  isHr,
  badgeLabel = 'Assigned',
  editingTravelId,
  editForm,
  onEditStart,
  onUpdate,
  onDelete,
  onCancelEdit,
  onViewDocuments,
  onViewExpenses,
  isUpdating,
  employeeOptions,
  onSearch,
  isLoadingOptions,
  isEditLoading
}: TravelListProps) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = editForm

  const editingTravel = travels.find((travel) => travel.travelId === editingTravelId)
  const startDateValue = watch('startDate')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingTravelId !== null) {
        onCancelEdit()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingTravelId, onCancelEdit])

  return (
    <>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,320px))] justify-center sm:justify-start">
        {travels.map((travel) => (
          <Card key={travel.travelId} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{travel.travelName}</h3>
                <p className="text-sm text-slate-500">{travel.destination}</p>
              </div>
              <Badge tone="info">{badgeLabel}</Badge>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium">Dates:</span> {formatDate(travel.startDate)} →
              {formatDate(travel.endDate)}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                type="button"
                onClick={() => onViewDocuments(travel.travelId)}
              >
                View documents
              </button>
              <button
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                type="button"
                onClick={() => onViewExpenses(travel.travelId)}
              >
                View expenses
              </button>
              {isHr ? (
                <>
                  <button
                    className="text-sm font-semibold text-slate-600 hover:text-slate-700"
                    type="button"
                    onClick={() => onEditStart(travel.travelId)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                    type="button"
                    onClick={() => onDelete(travel.travelId)}
                  >
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {isHr && editingTravelId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0" onClick={onCancelEdit} aria-hidden="true" />
          <Card className="relative z-10 w-full max-w-3xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit travel{editingTravel ? `: ${editingTravel.travelName}` : ''}
                </h3>
                <p className="text-xs text-slate-500">Update trip details and assigned employees.</p>
              </div>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                type="button"
                onClick={onCancelEdit}
                aria-label="Close edit travel form"
              >
                ×
              </button>
            </div>

            {isEditLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
                <Spinner /> Loading travel details...
              </div>
            ) : (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onUpdate)}>
                <Input
                  label="Travel name"
                  error={errors.travelName?.message}
                  {...register('travelName', {
                    required: 'Travel name is required.',
                    validate: (value) => value.trim().length > 0 || 'Travel name is required.'
                  })}
                />
                <Input
                  label="Destination"
                  error={errors.destination?.message}
                  {...register('destination', {
                    required: 'Destination is required.',
                    validate: (value) => value.trim().length > 0 || 'Destination is required.'
                  })}
                />
                <Input label="Purpose" {...register('purpose')} />
                <Controller
                  name="assignments"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value && value.length > 0 ? true : 'At least one employee must be assigned.'
                  }}
                  render={({ field }) => (
                    <AsyncSearchableMultiSelect
                      label="Assignments"
                      options={employeeOptions.map((employee) => ({
                        value: employee.id,
                        label: `${employee.fullName} (${employee.email})`
                      }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onSearch={onSearch}
                      isLoading={isLoadingOptions}
                      error={errors.assignments?.message as string | undefined}
                    />
                  )}
                />
                <Input
                  label="Start date"
                  type="date"
                  error={errors.startDate?.message}
                  {...register('startDate', { required: 'Start date is required.' })}
                />
                <Input
                  label="End date"
                  type="date"
                  error={errors.endDate?.message}
                  {...register('endDate', {
                    required: 'End date is required.',
                    validate: (value) => {
                      if (!startDateValue || !value) {
                        return true
                      }
                      return new Date(value) >= new Date(startDateValue)
                        ? true
                        : 'End date must be on or after start date.'
                    }
                  })}
                />
                <div className="md:col-span-2 flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      ) : null}
    </>
  )
}