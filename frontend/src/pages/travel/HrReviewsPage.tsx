import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Review, type ReviewFormValues } from '../../components/Review'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { AsyncSearchableSelect } from '../../components/ui/AsyncSearchableSelect'
import { SearchableSelect } from '../../components/ui/SearchableSelect'
import { Header } from '../../components/Header'
import { Spinner } from '../../components/ui/Spinner'
import { useEmployeeSearch } from '../../hooks/useEmployeeSearch'
import { useHrExpenses, type ExpenseFilters } from '../../hooks/travel/useExpenses'
import { useReviewExpense } from '../../hooks/travel/useExpenseReview'
import { useAssignedTravels } from '../../hooks/travel/useTravel'
import { formatCurrency, formatDate } from '../../utils/format'

type EmployeeOption = { id: number; fullName: string; email: string }
type TravelOption = { travelId: number; travelName: string; startDate: string; endDate: string }
type ExpenseProof = { proofId: number; fileName: string; filePath: string }
type ReviewExpenseItem = {
  expenseId: number
  amount: number
  currency: string
  expenseDate: string
  categoryId: number
  employeeId?: number
  status: string
  remarks?: string
  proofs?: ExpenseProof[]
}
 
const statusTone = (status: string) => {
  if (status === 'Approved') return 'success'
  if (status === 'Rejected') return 'warning'
  if (status === 'Submitted') return 'info'
  return 'neutral'
}
 
export const HrReviewsPage = () => {
  const { control, register, setValue, watch } = useForm<ExpenseFilters>({
    defaultValues: {
      employeeId: undefined,
      travelId: undefined,
      status: 'Submitted',
      from: '',
      to: ''
    }
  })
 
  const [searchQuery, setSearchQuery] = useState('')
  const filters = watch()
  const selectedEmployeeId = filters.employeeId ? Number(filters.employeeId) : undefined
  const canFetchTravels = Boolean(selectedEmployeeId)
  const employeeOptionsQuery = useEmployeeSearch(searchQuery, searchQuery.length >= 2)
  const travelOptionsQuery = useAssignedTravels(selectedEmployeeId, canFetchTravels)
  const normalizedFilters = {
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
    travelId: filters.travelId ? Number(filters.travelId) : undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined
  }
  const isValidFilterRange =
    !normalizedFilters.from ||
    !normalizedFilters.to ||
    new Date(normalizedFilters.from) <= new Date(normalizedFilters.to)
 
  const hrExpenses = useHrExpenses(normalizedFilters, isValidFilterRange)
  const reviewExpense = useReviewExpense()
  const cardGridClass =
    'grid gap-3 grid-cols-[repeat(auto-fill,minmax(320px,420px))] justify-center sm:justify-start'
 
  const handleReview = async (expenseId: number, values: ReviewFormValues) => {
    await reviewExpense.mutateAsync({
      expenseId,
      status: values.status,
      remarks: values.remarks
    })
    await hrExpenses.refetch()
  }
 
  return (
    <section className="space-y-6">
      <Header
        title="HR expense reviews"
        description="Approve or reject submitted expenses with required remarks on rejection."
      />
 
      <Card className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Filters</h3>
          <p className="text-xs text-slate-500">Filter by employee, travel, status, or date range.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <AsyncSearchableSelect
                label="Employee"
                options={
                  (employeeOptionsQuery.data ?? []).map((employee: EmployeeOption) => ({
                    value: employee.id,
                    label: `${employee.fullName} (${employee.email})`
                  }))
                }
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                  setValue('travelId', undefined)
                }}
                onSearch={setSearchQuery}
                isLoading={employeeOptionsQuery.isLoading}
              />
            )}
          />
          <SearchableSelect
            label="Travel"
            options={
              travelOptionsQuery.data?.map((travel: TravelOption) => ({
                value: travel.travelId,
                label: `${travel.travelName} (${formatDate(travel.startDate)} → ${formatDate(travel.endDate)})`
              })) ?? []
            }
            value={filters.travelId ? Number(filters.travelId) : undefined}
            placeholder={selectedEmployeeId ? 'Search…' : 'Select an employee first'}
            onChange={(value) => setValue('travelId', value)}
            disabled={!selectedEmployeeId}
          />
          <Input label="Status" placeholder="Submitted / Approved / Rejected" {...register('status')} />
          <Input label="From" type="date" {...register('from')} />
          <Input label="To" type="date" {...register('to')} />
        </div>
        {!isValidFilterRange ? (
          <p className="text-sm text-red-600">From date must be on or before To date.</p>
        ) : null}
      </Card>
 
      {hrExpenses.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading expenses...
        </div>
      ) : null}
 
      {hrExpenses.isError ? (
        <Card>
          <p className="text-sm text-red-600">Unable to load expenses right now.</p>
        </Card>
      ) : null}
 
      {hrExpenses.data?.length ? (
        <div className={cardGridClass}>
          {(hrExpenses.data as ReviewExpenseItem[]).map((expense) => (
            <Card key={expense.expenseId} className="flex h-full flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(expense.amount, expense.currency)} · {formatDate(expense.expenseDate)}
                </p>
                <p className="text-xs text-slate-500">
                  Expense ID: {expense.expenseId} · Category: {expense.categoryId} · Employee: {expense.employeeId}
                </p>
                {expense.proofs?.length ? (
                  <div className="text-xs text-slate-500">
                    <span className="font-medium">Proofs:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {expense.proofs.map((proof: ExpenseProof) => (
                        <a
                          key={proof.proofId}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                          href={proof.filePath}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {proof.fileName || `Proof ${proof.proofId}`}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Proofs: none</p>
                )}
                {expense.remarks ? <p className="text-xs text-slate-500">Remarks: {expense.remarks}</p> : null}
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Badge tone={statusTone(expense.status)}>{expense.status}</Badge>
                {expense.status === 'Submitted' ? (
                  <Review
                    expenseId={expense.expenseId}
                    onReview={handleReview}
                    isPending={reviewExpense.isPending}
                  />
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
 
      {!hrExpenses.isLoading && !hrExpenses.isError && !hrExpenses.data?.length ? (
        <EmptyState title="No expenses to review" description="Submitted expenses will appear here." />
      ) : null}
    </section>
  )
}
 