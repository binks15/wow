import { Controller, type Control, type UseFormRegister } from 'react-hook-form'
import { AsyncSearchableSelect } from '../ui/AsyncSearchableSelect'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import type { EmployeeOption } from '../../types/employee'
 
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
  onSearch: (query: string) => void
  isLoadingOptions: boolean
}
 
export const ExpenseFiltersPanel = ({
  control,
  register,
  employeeOptions,
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
      <Input label="Travel ID" type="number" placeholder="e.g. 18" {...register('travelId')} />
      <Input label="Status" placeholder="Submitted / Approved / Rejected" {...register('status')} />
      <Input label="From" type="date" {...register('from')} />
      <Input label="To" type="date" {...register('to')} />
    </div>
  </Card>
)
 