import React, { memo } from "react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Review, type ReviewFormValues } from "../Review";
import { formatCurrency, formatDate } from "../../utils/format";

export interface Expense {
  expenseId: number;
  amount: number;
  currency: string;
  expenseDate: string;
  categoryId: number;
  categoryName?: string | null;
  status: string;
  remarks?: string;
  proofs?: Array<{ proofId: number; fileName: string; filePath: string }>;
  employeeId?: number;
  employeeName?: string | null;
  submittedAt?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
}

interface ExpenseListItemProps {
  expense: Expense;
  isHr: boolean;
  isEmployee: boolean;
  onReview: (expenseId: number, formValues: ReviewFormValues) => Promise<void>;
  reviewPending: boolean;
  children?: React.ReactNode;
}

const statusTone = (status: string) => {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "warning";
  if (status === "Submitted") return "info";
  return "neutral";
};

const statusCardClass = (status: string) => {
  if (status === "Submitted") return "border-amber-200 bg-amber-50/30";
  if (status === "Approved") return "border-emerald-200 bg-emerald-50/30";
  if (status === "Rejected") return "border-red-200 bg-red-50/30";
  return "border-slate-200 bg-white";
};

export const ExpenseListItem = memo(
  ({
    expense,
    isHr,
    onReview,
    reviewPending,
    children,
  }: ExpenseListItemProps) => (
    <Card className={`flex h-full flex-col gap-4 p-4 border ${statusCardClass(expense.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Expense</p>
          <p className="text-base font-semibold text-slate-900">
            {formatCurrency(expense.amount, expense.currency)}
          </p>
          <p className="text-xs text-slate-600">{formatDate(expense.expenseDate)}</p>
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            {expense.employeeName ? <p>Employee: {expense.employeeName}</p> : null}
            {expense.categoryName ? <p>Category: {expense.categoryName}</p> : null}
            {expense.submittedAt ? <p>Submitted: {formatDate(expense.submittedAt)}</p> : null}
            {expense.reviewedByName ? <p>Reviewed by: {expense.reviewedByName}</p> : null}
            {expense.reviewedAt ? <p>Reviewed on: {formatDate(expense.reviewedAt)}</p> : null}
          </div>
        </div>
        <Badge tone={statusTone(expense.status)}>{expense.status}</Badge>
      </div>

      {expense.proofs?.length ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-700">Proofs</p>
          <div className="flex flex-wrap gap-2">
            {expense.proofs.map((proof) => (
              <a
                key={proof.proofId}
                className="text-xs font-semibold underline text-blue-800 hover:text-blue-600"
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
        <div className="rounded-md bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium text-slate-700">Remarks</p>
          <p className="text-xs text-slate-600">{expense.remarks}</p>
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-3">
        {isHr && expense.status === "Submitted" ? (
          <Review
            expenseId={expense.expenseId}
            onReview={onReview}
            isPending={reviewPending}
          />
        ) : null}
      </div>
      {children ? (
        <div className="border-t border-slate-200 pt-4">{children}</div>
      ) : null}
    </Card>
  ),
);