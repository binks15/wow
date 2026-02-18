import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
 
export type DraftEditValues = {
  categoryId: number | ''
  amount: number | ''
  currency: string
  expenseDate: string
}
 
interface DraftActionsProps {
  expenseId: number
  isEditing: boolean
  editValues: DraftEditValues
  draftMessage?: string
  categories: Array<{ categoryId: number; categoryName: string; maxAmountPerDay: number }> | undefined
  proofs: Array<{ proofId: number; fileName: string; filePath: string }> | undefined
  draftFile: File | null
  onStartEdit: () => void
  onFieldChange: (field: keyof DraftEditValues, value: string | number) => void
  onSaveDraft: () => void
  onCancelEdit: () => void
  onDeleteDraft: () => void
  onUploadProof: () => void
  onDeleteProof: (proofId: number) => void
  onFilePicked: (file: File | null) => void
  isUploadingProof: boolean
  isSubmitting: boolean
  isSaving: boolean
  isDeleting: boolean
}
 
export const DraftActions = ({
  isEditing,
  editValues,
  draftMessage,
  categories,
  proofs,
  draftFile,
  onStartEdit,
  onFieldChange,
  onSaveDraft,
  onCancelEdit,
  onDeleteDraft,
  onUploadProof,
  onDeleteProof,
  onFilePicked,
  isUploadingProof,
  isSubmitting,
  isSaving,
  isDeleting
}: DraftActionsProps) => {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">Draft actions</h4>
        <p className="text-xs text-slate-500">Edit fields and manage proof files before final submission.</p>
      </div>
 
      {isEditing ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Category"
            value={editValues.categoryId ?? ''}
            onChange={(event) => onFieldChange('categoryId', Number(event.target.value))}
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
            value={editValues.amount ?? ''}
            onChange={(event) => onFieldChange('amount', Number(event.target.value))}
          />
          <Input
            label="Currency"
            value={editValues.currency}
            onChange={(event) => onFieldChange('currency', event.target.value)}
          />
          <Input
            label="Expense date"
            type="date"
            value={editValues.expenseDate}
            onChange={(event) => onFieldChange('expenseDate', event.target.value)}
          />
        </div>
      ) : null}
 
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Proof file"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.item(0) ?? null
            onFilePicked(file)
          }}
        />
        <div className="flex flex-col gap-2 md:justify-end">
          <button
            className="inline-flex w-full items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
            type="button"
            onClick={onUploadProof}
            disabled={isUploadingProof || isSubmitting || !draftFile}
          >
            {isUploadingProof ? 'Uploading...' : 'Upload proof'}
          </button>
        </div>
      </div>
 
      <div className="flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <button
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              className="text-sm font-semibold text-slate-500 hover:text-slate-600"
              type="button"
              onClick={onCancelEdit}
            >
              Cancel edit
            </button>
          </>
        ) : (
          <button
            className="text-sm font-semibold text-slate-600 hover:text-slate-700"
            type="button"
            onClick={onStartEdit}
          >
            Edit draft
          </button>
        )}
        <button
          className="text-sm font-semibold text-red-600 hover:text-red-700"
          type="button"
          onClick={onDeleteDraft}
          disabled={isDeleting}
        >
          Delete draft
        </button>
      </div>
 
      {proofs?.length ? (
        <div className="text-xs text-slate-500">
          <span className="font-medium">Manage proofs:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {proofs.map((proof) => (
              <button
                key={proof.proofId}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
                type="button"
                onClick={() => onDeleteProof(proof.proofId)}
                disabled={isDeleting}
              >
                Delete {proof.fileName || `Proof ${proof.proofId}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}
 
      {draftMessage ? <p className="text-xs text-slate-600">{draftMessage}</p> : null}
    </div>
  )
}
 