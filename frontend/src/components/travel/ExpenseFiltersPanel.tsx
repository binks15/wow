import { Controller, type Control, type UseFormRegister } from 'react-hook-form'
import { AsyncSearchableSelect } from '../ui/AsyncSearchableSelect'
import { SearchableSelect } from '../ui/SearchableSelect'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import type { EmployeeOption } from '../../types/employee'
import type { TravelAssigned } from '../../types/travel'
import { formatDate } from '../../utils/format'
 
export interface ExpenseFilters {
  employeeId?: number | string
  travelId?: number | string
  status?: string
  from?: string
  to?: string
}
 
interface ExpenseFiltersProps {
  control: Control<ExpenseFilters>
  register: UseFormRegister<ExpenseFilters>
  employeeOptions: EmployeeOption[]
  travelOptions: TravelAssigned[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
}
 
export const ExpenseFiltersPanel = ({
  control,
  register,
  employeeOptions,
  travelOptions,
  onSearch,
  isLoadingOptions
}: ExpenseFiltersProps) => (
  <Card className="space-y-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900">Filters</h3>
      <p className="text-xs text-slate-500">Use filters to narrow down expenses for review.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Controller
        name="employeeId"
        control={control}
        render={({ field }) => (
          <AsyncSearchableSelect
            label="Employee"
            options={employeeOptions.map((employee) => ({
              value: employee.id,
              label: `${employee.fullName} (${employee.email})`
            }))}
            value={field.value ? Number(field.value) : undefined}
            onChange={(value) => field.onChange(value)}
            onSearch={onSearch}
            isLoading={isLoadingOptions}
          />
        )}
      />
      <Controller
        name="travelId"
        control={control}
        render={({ field }) => (
          <SearchableSelect
            label="Travel"
            options={travelOptions.map((travel) => ({
              value: travel.travelId,
              label: `${travel.travelName} (${formatDate(travel.startDate)} → ${formatDate(travel.endDate)})`
            }))}
            value={field.value ? Number(field.value) : undefined}
            onChange={(value) => field.onChange(value)}
          />
        )}
      />
      <Input label="Status" placeholder="Submitted / Approved / Rejected" {...register('status')} />
      <Input label="From" type="date" {...register('from')} />
      <Input label="To" type="date" {...register('to')} />
    </div>
  </Card>
)
 