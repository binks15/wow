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
  status: string;
  remarks?: string;
  proofs?: Array<{ proofId: number; fileName: string; filePath: string }>;
  employeeId?: number;
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

export const ExpenseListItem = memo(
  ({
    expense,
    isHr,
    onReview,
    reviewPending,
    children,
  }: ExpenseListItemProps) => (
    <Card className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-3  md:items-start md:justify-between">
        <div className="flex flex-row items-center justify-between w-full">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(expense.amount, expense.currency)} ·{" "}
              {formatDate(expense.expenseDate)}
            </p>
            {expense.proofs?.length ? (
              <div className="text-xs flex gap-2 text-slate-900">
                <span className="font-medium">Proofs:</span>
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
                {/* </div> */}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Proofs: none</p>
            )}
            {expense.remarks ? (
              <p className="text-xs text-slate-500">
                Remarks: {expense.remarks}
              </p>
            ) : null}
          </div>
          <Badge tone={statusTone(expense.status)}>{expense.status}</Badge>
        </div>
        <div className="flex flex-col items-start gap-3 ">
          {isHr && expense.status === "Submitted" ? (
            <Review
              expenseId={expense.expenseId}
              onReview={onReview}
              isPending={reviewPending}
            />
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-slate-200 pt-4">{children}</div>
      ) : null}
    </Card>
  ),
);
