import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { formatDate } from '../../utils/format'
import type { TravelDocument } from '../../types/document'

const allowedDocumentFileAccept = '.pdf,.jpg,.jpeg,application/pdf,image/jpeg'

export type TravelDocumentEdits = Record<
  number,
  {
    documentType: string
    file: File | null
  }
>

interface TravelDocumentListProps {
  documents: TravelDocument[]
  editDocs: TravelDocumentEdits
  userId?: number
  onEditChange: (
    documentId: number,
    field: 'documentType' | 'file',
    value: string | File | null
  ) => void
  onStartEdit: (document: TravelDocument) => void
  onSaveEdit: (documentId: number) => void
  onCancelEdit: (documentId: number) => void
  onDelete: (documentId: number) => void
  isSaving: boolean
  isDeleting: boolean
}

export const TravelDocumentList = ({
  documents,
  editDocs,
  userId,
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isSaving,
  isDeleting
}: TravelDocumentListProps) => (
  <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,320px))] justify-center sm:justify-start">
    {documents.map((doc) => {
      const isEditing = Boolean(editDocs[doc.documentId])

      return (
        <Card
          key={doc.documentId}
          className="flex flex-col gap-2  "
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{doc.documentType}</p>
            <p className="text-xs text-slate-500">{doc.fileName}</p>
            <p className="text-xs text-slate-500">Uploaded {formatDate(doc.uploadedAt)}</p>
            {doc.employeeId ? (
              <p className="text-xs text-slate-500">
                Submitted by: {doc.uploadedByName ?? `Employee #${doc.employeeId}`}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Applies to all assigned employees</p>
            )}
            {isEditing ? (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <Input
                  label="Document type"
                  value={editDocs[doc.documentId].documentType}
                  onChange={(event) =>
                    onEditChange(doc.documentId, 'documentType', event.target.value)
                  }
                />
                <Input
                  label="Replace file"
                  type="file"
                  accept={allowedDocumentFileAccept}
                  onChange={(event) =>
                    onEditChange(doc.documentId, 'file', event.target.files?.item(0) ?? null)
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              href={doc.filePath}
              target="_blank"
              rel="noreferrer"
            >
              View file
            </a>
            {doc.uploadedById === userId ? (
              isEditing ? (
                <>
                  <button
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                    type="button"
                    onClick={() => onSaveEdit(doc.documentId)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="text-sm font-semibold text-slate-500 hover:text-slate-600"
                    type="button"
                    onClick={() => onCancelEdit(doc.documentId)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="text-sm font-semibold text-slate-600 hover:text-slate-700"
                    type="button"
                    onClick={() => onStartEdit(doc)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                    type="button"
                    onClick={() => onDelete(doc.documentId)}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </>
              )
            ) : null}
          </div>
        </Card>
      )
    })}
  </div>
)