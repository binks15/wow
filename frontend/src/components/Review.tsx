import { useForm } from 'react-hook-form'
import { Select } from './ui/Select'

export type ReviewFormValues = {
  status: 'Approved' | 'Rejected'
  remarks?: string
}

type ReviewControlsProps = {
  expenseId: number
  onReview: (expenseId: number, values: ReviewFormValues) => Promise<void>
  isPending: boolean
  variant?: 'inline' | 'modal'
  onCancel?: () => void
}

export const Review = ({
  expenseId,
  onReview,
  isPending,
  variant = 'inline',
  onCancel
}: ReviewControlsProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ReviewFormValues>({
    defaultValues: { status: 'Approved', remarks: '' }
  })

  const status = watch('status')
  const isModal = variant === 'modal'

  return (
    <form
      className={`w-full space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 ${
        isModal ? 'max-w-md' : 'md:w-72'
      }`}
      onSubmit={handleSubmit((values) => onReview(expenseId, values))}
    >
      <Select label="Decision" {...register('status')}>
        <option value="Approved">Approve</option>
        <option value="Rejected">Reject</option>
      </Select>
      <label className="block space-y-2 text-sm">
        <span className="font-medium text-slate-700">Remarks</span>
        <textarea
          rows={3}
          placeholder="Add remarks (required for rejection)"
          className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 ${
            errors.remarks?.message ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
          }`}
          {...register('remarks', {
            validate: (value) =>
              status === 'Rejected' && !value?.trim()
                ? 'Remarks are required for rejection.'
                : true
          })}
        />
        {errors.remarks?.message ? <span className="text-xs text-red-500">{errors.remarks.message}</span> : null}
      </label>
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Submit review'}
        </button>
      </div>
    </form>
  )
}