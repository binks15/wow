import { useForm } from 'react-hook-form'
import { Input } from './ui/Input'
import { Select } from './ui/Select'

export type ReviewFormValues = {
  status: 'Approved' | 'Rejected'
  remarks?: string
}

type ReviewControlsProps = {
  expenseId: number
  onReview: (expenseId: number, values: ReviewFormValues) => Promise<void>
  isPending: boolean
}

export const Review = ({ expenseId, onReview, isPending }: ReviewControlsProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ReviewFormValues>({
    defaultValues: { status: 'Approved', remarks: '' }
  })

  const status = watch('status')

  return (
    <form
      className="w-full space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 md:w-72"
      onSubmit={handleSubmit((values) => onReview(expenseId, values))}
    >
      <Select label="Decision" {...register('status')}>
        <option value="Approved">Approve</option>
        <option value="Rejected">Reject</option>
      </Select>
      <Input
        label="Remarks"
        placeholder="Add remarks for rejection"
        error={errors.remarks?.message}
        {...register('remarks', {
          validate: (value) => (status === 'Rejected' && !value ? 'Remarks are required for rejection.' : true)
        })}
      />
      <button
        type="submit"
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
        disabled={isPending}
      >
        {isPending ? 'Saving...' : 'Submit review'}
      </button>
    </form>
  )
}