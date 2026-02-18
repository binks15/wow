import { Controller, type Control } from 'react-hook-form'
import { AsyncSearchableSelect } from '../ui/AsyncSearchableSelect'
import { Card } from '../ui/Card'
import type { EmployeeOption } from '../../types/employee'
import type { TravelFilterValues } from '../../types/travel-forms'

interface TravelLookupPanelProps {
  control: Control<TravelFilterValues>
  employeeOptions: EmployeeOption[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
}

export const TravelLookupPanel = ({
  control,
  employeeOptions,
  onSearch,
  isLoadingOptions
}: TravelLookupPanelProps) => (
  <Card className="space-y-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900">Lookup assigned travels</h3>
      <p className="text-xs text-slate-500">Select an employee to view assigned travels.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
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
            value={field.value}
            onChange={field.onChange}
            onSearch={onSearch}
            isLoading={isLoadingOptions}
          />
        )}
      />
    </div>
  </Card>
)