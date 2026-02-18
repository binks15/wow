import { Controller, type UseFormReturn } from 'react-hook-form'
import { AsyncSearchableMultiSelect } from '../ui/AsyncSearchableMultiSelect '
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
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
  isUpdating: boolean
  employeeOptions: EmployeeOption[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
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
  isUpdating,
  employeeOptions,
  onSearch,
  isLoadingOptions
}: TravelListProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = editForm

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
          {isHr && editingTravelId === travel.travelId ? (
            <form className="grid gap-3" onSubmit={handleSubmit(onUpdate)}>
              <Input label="Travel name" {...register('travelName', { required: true })} />
              <Input label="Destination" {...register('destination', { required: true })} />
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
              <Input label="Start date" type="date" {...register('startDate', { required: true })} />
              <Input label="End date" type="date" {...register('endDate', { required: true })} />
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold bg-(--color-primary) hover:bg-brand-700 disabled:opacity-70"
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </Card>
      ))}
    </div>
  )
}