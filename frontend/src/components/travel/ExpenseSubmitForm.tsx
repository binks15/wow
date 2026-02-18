import { type UseFormReturn } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { SearchableSelect } from '../ui/SearchableSelect'
import { formatDate } from '../../utils/format'
 
export type ExpenseFormValues = {
  assignId?: number
  categoryId: number
  amount: number
  currency: string
  expenseDate: string
  proof: FileList
}
 
interface ExpenseSubmitFormProps {
  form: UseFormReturn<ExpenseFormValues>
  onSubmit: (values: ExpenseFormValues) => void
  categories: Array<{ categoryId: number; categoryName: string; maxAmountPerDay: number }> | undefined
  assignments:
    | Array<{
        assignId: number
        travelName: string
        startDate: string
        endDate: string
      }>
    | undefined
  isLoading: boolean
  isSubmitting: boolean
  submitMessage: string
  submitMessageTone: 'success' | 'error'
}
 
export const ExpenseSubmitForm = ({
  form,
  onSubmit,
  categories,
  assignments,
  isLoading,
  isSubmitting,
  submitMessage,
  submitMessageTone
}: ExpenseSubmitFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = form
 
  const selectedAssignId = watch('assignId')
 
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Submit an expense</h3>
        <p className="text-xs text-slate-500">Add a proof document to submit your expense.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register('assignId', {
            required: 'Assignment is required.',
            valueAsNumber: true,
            min: { value: 1, message: 'Assignment is required.' }
          })}
        />
        <SearchableSelect
          label="Assignment"
          options={
            assignments?.map((assignment) => ({
              value: assignment.assignId,
              label: `${assignment.travelName} (${formatDate(assignment.startDate)} → ${formatDate(assignment.endDate)})`
            })) ?? []
          }
          value={watch('assignId')}
          onChange={(value) => {
            setValue('assignId', value)
          }}
          error={errors.assignId?.message}
          disabled={isLoading}
        />
        {isLoading ? (
          <p className="text-xs text-slate-500 md:col-span-2">Loading assignments...</p>
        ) : null}
        {!isLoading && !assignments?.length ? (
          <p className="text-xs text-amber-600 md:col-span-2">
            No assignments found. Ask HR to assign a travel plan.
          </p>
        ) : null}
        <Select
          label="Category"
          error={errors.categoryId?.message}
          {...register('categoryId', {
            required: 'Category is required.',
            valueAsNumber: true,
            min: { value: 1, message: 'Category is required.' }
          })}
        >
          <option value="">Select category</option>
          {categories?.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName} (Max {category.maxAmountPerDay})
            </option>
          ))}
        </Select>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Amount is required.',
            valueAsNumber: true,
            min: { value: 0.01, message: 'Amount must be positive.' }
          })}
        />
        <Input
          label="Currency"
          error={errors.currency?.message}
          {...register('currency', {
            required: 'Currency is required.',
            validate: (value) => /^[A-Za-z]{3}$/.test(value.trim()) || 'Use a 3-letter currency code.'
          })}
        />
        <Input
          label="Expense date"
          type="date"
          error={errors.expenseDate?.message}
          {...register('expenseDate', {
            required: 'Date is required.',
            validate: (value) => {
              const assignment = assignments?.find((item) => item.assignId === Number(selectedAssignId))
 
              if (!assignment) {
                return 'Select an assignment to validate the date.'
              }
 
              const start = new Date(assignment.startDate)
              const end = new Date(assignment.endDate)
              const allowedEnd = new Date(end)
              allowedEnd.setDate(end.getDate() + 10)
              const selected = new Date(value)
 
              if (selected < start || selected > allowedEnd) {
                return 'Expense date must be within travel dates and 10 days after end date.'
              }
 
              return true
            }
          })}
        />
        <Input
          label="Proof file"
          type="file"
          error={errors.proof?.message}
          {...register('proof', {
            required: 'Proof file is required.',
            validate: (value) => (value?.length ?? 0) > 0 || 'Proof file is required.'
          })}
        />
        <div className="md:col-span-2">
          <button
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-700 disabled:opacity-70"
            type="submit"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Submitting...' : 'Submit expense'}
          </button>
        </div>
      </form>
      {submitMessage ? (
        <p className={`text-sm ${submitMessageTone === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {submitMessage}
        </p>
      ) : null}
    </div>
  )
}
 