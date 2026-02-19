import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Review, type ReviewFormValues } from '../../components/Review'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { AsyncSearchableSelect } from '../../components/ui/AsyncSearchableSelect'
import { SearchableSelect } from '../../components/ui/SearchableSelect'
import { Header } from '../../components/Header'
import { Spinner } from '../../components/ui/Spinner'
import { useEmployeeSearch } from '../../hooks/useEmployeeSearch'
import { useHrExpenses, type ExpenseFilters } from '../../hooks/travel/useExpenses'
import { useReviewExpense } from '../../hooks/travel/useExpenseReview'
import { useAssignedTravels } from '../../hooks/travel/useTravel'
import { formatCurrency, formatDate } from '../../utils/format'
import { FiEdit2, FiFilter } from 'react-icons/fi'

type EmployeeOption = { id: number; fullName: string; email: string }
type TravelOption = { travelId: number; travelName: string }
type ExpenseProof = { proofId: number; fileName: string; filePath: string }
type ReviewExpenseItem = {
  expenseId: number
  amount: number
  currency: string
  expenseDate: string
  categoryId: number
  categoryName?: string | null
  employeeId?: number
  employeeName?: string | null
  status: string
  submittedAt?: string | null
  reviewedByName?: string | null
  reviewedAt?: string | null
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
  const [showFilters, setShowFilters] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)
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
  const editingExpense =
    (hrExpenses.data as ReviewExpenseItem[] | undefined)?.find(
      (expense) => expense.expenseId === editingExpenseId,
    ) ?? null
 
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Filters</h3>
            <p className="text-xs text-slate-500">Use filters only when needed to keep the view clean.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <FiFilter />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>
        </div>

        {showFilters ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="min-w-0">
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
              </div>
              <div className="min-w-0">
                <SearchableSelect
                  label="Travel"
                  options={
                    travelOptionsQuery.data?.map((travel: TravelOption) => ({
                      value: travel.travelId,
                      label: travel.travelName
                    })) ?? []
                  }
                  value={filters.travelId ? Number(filters.travelId) : undefined}
                  placeholder={selectedEmployeeId ? 'Search…' : 'Select an employee first'}
                  onChange={(value) => setValue('travelId', value)}
                  disabled={!selectedEmployeeId}
                />
              </div>
              <div className="min-w-0">
                <Select
                  label="Status"
                  value={filters.status ?? ''}
                  {...register('status')}
                >
                  <option value="">All</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </div>
              <div className="min-w-0">
                <Input label="From" type="date" {...register('from')} />
              </div>
              <div className="min-w-0">
                <Input label="To" type="date" {...register('to')} />
              </div>
            </div>
            {!isValidFilterRange ? (
              <p className="text-sm text-red-600">From date must be on or before To date.</p>
            ) : null}
          </>
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
            <Card key={expense.expenseId} className="flex h-full flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(expense.expenseDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(expense.status)}>{expense.status}</Badge>
                  {expense.status === 'Submitted' ? (
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 p-2 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      onClick={() =>
                        setEditingExpenseId((prev) =>
                          prev === expense.expenseId ? null : expense.expenseId,
                        )
                      }
                      aria-label="Review expense"
                      title="Review expense"
                    >
                      <FiEdit2 size={14} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-1 text-xs text-slate-600">
                <p>Employee: {expense.employeeName || 'N/A'}</p>
                <p>Category: {expense.categoryName || 'N/A'}</p>
                {expense.submittedAt ? <p>Submitted: {formatDate(expense.submittedAt)}</p> : null}
                {expense.reviewedByName ? <p>Reviewed by: {expense.reviewedByName}</p> : null}
                {expense.reviewedAt ? <p>Reviewed on: {formatDate(expense.reviewedAt)}</p> : null}
              </div>

              {expense.proofs?.length ? (
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-xs font-medium text-slate-700">Proofs</p>
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

              {expense.remarks ? (
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-xs font-medium text-slate-700">Remarks</p>
                  <p className="text-xs text-slate-600">{expense.remarks}</p>
                </div>
              ) : null}

            </Card>
          ))}
        </div>
      ) : null}

      {editingExpense ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingExpenseId(null)}
        >
          <Card
            className="w-full max-w-lg space-y-4 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Give review</h3>
                <p className="text-xs text-slate-500">
                  {editingExpense.employeeName || 'Employee'} • {formatCurrency(editingExpense.amount, editingExpense.currency)} • {formatDate(editingExpense.expenseDate)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:border-brand-200 hover:bg-brand-50"
                onClick={() => setEditingExpenseId(null)}
              >
                Close
              </button>
            </div>

            <Review
              expenseId={editingExpense.expenseId}
              onReview={async (expenseId, values) => {
                await handleReview(expenseId, values)
                setEditingExpenseId(null)
              }}
              isPending={reviewExpense.isPending}
              variant="modal"
              onCancel={() => setEditingExpenseId(null)}
            />
          </Card>
        </div>
      ) : null}
 
      {!hrExpenses.isLoading && !hrExpenses.isError && !hrExpenses.data?.length ? (
        <EmptyState title="No expenses to review" description="Submitted expenses will appear here." />
      ) : null}
    </section>
  )
}
 