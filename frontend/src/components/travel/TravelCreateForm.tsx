import { Controller, type UseFormReturn } from 'react-hook-form'
import { AsyncSearchableMultiSelect } from '../ui/AsyncSearchableMultiSelect '
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { EmployeeOption } from '../../types/employee'
import type { TravelCreateFormValues } from '../../types/travel-forms'

interface TravelCreateFormProps {
  form: UseFormReturn<TravelCreateFormValues>
  onSubmit: (values: TravelCreateFormValues) => void
  employeeOptions: EmployeeOption[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
  isSubmitting: boolean
  message: string
}

export const TravelCreateForm = ({
  form,
  onSubmit,
  employeeOptions,
  onSearch,
  isLoadingOptions,
  isSubmitting,
  message
}: TravelCreateFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = form

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Create travel plan</h3>
        <p className="text-xs text-slate-500">Assign employees using the dropdown list.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Travel name"
          error={errors.travelName?.message}
          {...register('travelName', {
            required: 'Travel name is required.'
          })}
        />
        <Input
          label="Destination"
          error={errors.destination?.message}
          {...register('destination', {
            required: 'Destination is required.'
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
              error={errors.assignments?.message}
            />
          )}
        />
        <Input
          label="Start date"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate', {
            required: 'Start date is required.'
          })}
        />
        <Input
          label="End date"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate', { required: 'End date is required.' })}
        />
        <div className="md:col-span-2">
          <Button
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold bg-(--color-primary) hover:bg-brand-700 disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create travel'}
          </Button>
        </div>
      </form>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </Card>
  )
}