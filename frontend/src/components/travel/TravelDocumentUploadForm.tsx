import { type UseFormReturn } from 'react-hook-form'
import {  SearchableSelect } from '../ui/SearchableSelect'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { formatDate } from '../../utils/format'
import type { EmployeeOption } from '../../types/employee'
import type { TravelAssigned } from '../../types/travel'
import type { DocumentFormValues } from '../../types/travel-document-forms'

interface TravelDocumentUploadFormProps {
  form: UseFormReturn<DocumentFormValues>
  onSubmit: (values: DocumentFormValues) => void
  isHr: boolean
  employeeOptions: EmployeeOption[]
  onSearch: (query: string) => void
  isLoadingOptions: boolean
  hrTravels?: TravelAssigned[]
  isLoadingHrTravels: boolean
  uploadTravels: TravelAssigned[] | undefined
  isLoadingTravels: boolean
  resolvedEmployeeId?: number
  isUploading: boolean
  message: string
}

export const TravelDocumentUploadForm = ({
  form,
  onSubmit,
  isHr,
  employeeOptions,
  onSearch,
  isLoadingOptions,
  hrTravels,
  isLoadingHrTravels,
  uploadTravels,
  isLoadingTravels,
  resolvedEmployeeId,
  isUploading,
  message
}: TravelDocumentUploadFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = form

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Upload document</h3>
        <p className="text-xs text-slate-500">Provide assignment and travel details to upload.</p>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="hidden"
          {...register('travelId', {
            required: 'Travel is required.',
            valueAsNumber: true
          })}
        />
        {isHr && watch('travelId') ? (
          <SearchableSelect
            label="Employee (optional)"
            options={employeeOptions.map((employee) => ({
              value: employee.id,
              label: `${employee.fullName} (${employee.email})`
            }))}
            value={watch('employeeId')}
            onChange={(value) => setValue('employeeId', value)}
            error={errors.employeeId?.message}
            disabled={isLoadingOptions}
          />
        ) : null}
        {isHr ? (
          <SearchableSelect
            label="Travel"
            options={
              hrTravels?.map((travel) => ({
                value: travel.travelId,
                label: `${travel.travelName} (${formatDate(travel.startDate)} → ${formatDate(travel.endDate)})`
              })) ?? []
            }
            value={watch('travelId')}
            onChange={(value) =>
              {
                setValue('travelId', value as number, {
                  shouldValidate: true
                })
                setValue('employeeId', undefined)
              }
            }
            error={errors.travelId?.message}
            disabled={isLoadingHrTravels}
          />
        ) : resolvedEmployeeId ? (
          <SearchableSelect
            label="Travel"
            options={
              uploadTravels?.map((travel) => ({
                value: travel.travelId,
                label: `${travel.travelName} (${formatDate(travel.startDate)} → ${formatDate(travel.endDate)})`
              })) ?? []
            }
            value={watch('travelId')}
            onChange={(value) =>
              setValue('travelId', value as number, {
                shouldValidate: true
              })
            }
            error={errors.travelId?.message}
            disabled={isLoadingTravels}
          />
        ) : (
          <Input
            label="Travel ID"
            type="number"
            error={errors.travelId?.message}
            {...register('travelId', {
              required: 'Travel ID is required.',
              valueAsNumber: true
            })}
          />
        )}
        <Input
          label="Document type"
          error={errors.documentType?.message}
          {...register('documentType', {
            required: 'Document type is required.'
          })}
        />
        <Input
          label="File"
          type="file"
          error={errors.file?.message}
          {...register('file', { required: 'File is required.' })}
        />
        <div className="md:col-span-2">
          <Button
            className="inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold bg-(--color-primary) hover:bg-brand-700 disabled:opacity-70"
            type="submit"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload document'}
          </Button>
        </div>
      </form>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </Card>
  )
}