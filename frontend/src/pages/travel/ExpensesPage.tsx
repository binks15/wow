import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import { Header } from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import { useEmployeeSearch } from "../../hooks/useEmployeeSearch";
import { useExpenseCategories } from "../../hooks/travel/useExpenseConfig";
import {
  useHrExpenses,
  useMyExpenses,
  type ExpenseFilters as ExpenseQueryFilters,
} from "../../hooks/travel/useExpenses";
import {
  useCreateExpenseDraft,
  useDeleteExpenseDraft,
  useDeleteExpenseProof,
  useSubmitExpense,
  useUpdateExpenseDraft,
  useUploadExpenseProof,
} from "../../hooks/travel/useExpenseMutations";
import { type ReviewFormValues } from "../../components/Review";
import { useReviewExpense } from "../../hooks/travel/useExpenseReview";
import { useTravelAssignments } from "../../hooks/travel/useTravel";
import {
  ExpenseSubmitForm,
  type ExpenseFormValues,
} from "../../components/travel/ExpenseSubmitForm";
import {
  ExpenseListItem,
  type Expense,
} from "../../components/travel/ExpenseListItem";
import {
  DraftActions,
  type DraftEditValues,
} from "../../components/travel/DraftActions";
import {
  ExpenseFiltersPanel,
  type ExpenseFilters as ExpenseFormFilters,
} from "../../components/travel/ExpenseFiltersPanel";

export const ExpensesPage = () => {
  const { role } = useAuth();
  const isHr = role === "HR";
  const isEmployee = role === "Employee";

  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageTone, setSubmitMessageTone] = useState<
    "success" | "error"
  >("success");
  const [draftFiles, setDraftFiles] = useState<Record<number, File | null>>({});
  const [draftMessages, setDraftMessages] = useState<Record<number, string>>(
    {},
  );
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
  const [draftEdits, setDraftEdits] = useState<Record<number, DraftEditValues>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filterForm = useForm<ExpenseFormFilters>({
    defaultValues: {
      employeeId: undefined,
      travelId: undefined,
      status: "",
      from: "",
      to: "",
    },
  });

  const expenseForm = useForm<ExpenseFormValues>({
    defaultValues: {
      assignId: undefined,
      categoryId: undefined,
      amount: undefined,
      currency: "INR",
      expenseDate: "",
    },
  });

  // Data fetching
  const filters = filterForm.watch();
  const normalizedFilters: ExpenseQueryFilters = {
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
    travelId: filters.travelId ? Number(filters.travelId) : undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const myExpenses = isHr ? null : useMyExpenses();
  const hrExpenses = useHrExpenses(normalizedFilters, isHr);
  const categoriesQuery = useExpenseCategories();
  const assignmentsQuery = useTravelAssignments(undefined, isEmployee);
  const employeesQuery = useEmployeeSearch(
    searchQuery,
    isHr && searchQuery.length >= 2,
  );
  const employeeOptions = employeesQuery.data ?? [];

  // Mutations
  const createDraft = useCreateExpenseDraft();
  const uploadProof = useUploadExpenseProof();
  const submitExpense = useSubmitExpense();
  const updateDraft = useUpdateExpenseDraft();
  const deleteDraft = useDeleteExpenseDraft();
  const deleteProof = useDeleteExpenseProof();
  const reviewExpense = useReviewExpense();

  // Derived state
  const list = isHr ? hrExpenses.data : myExpenses?.data;
  const isLoading = isHr ? hrExpenses.isLoading : myExpenses?.isLoading;
  const isError = isHr ? hrExpenses.isError : myExpenses?.isError;

  // Handlers
  const handleCreateExpense = async (values: ExpenseFormValues) => {
    setSubmitMessage("");
    setSubmitMessageTone("success");
    const proofFile = values.proof?.item(0);
    if (!proofFile) {
      setSubmitMessageTone("error");
      setSubmitMessage("Please attach a proof file before submitting.");
      return;
    }

    try {
      const draft = await createDraft.mutateAsync({
        assignId: values.assignId!,
        categoryId: values.categoryId,
        amount: values.amount,
        currency: values.currency,
        expenseDate: values.expenseDate,
      });

      await uploadProof.mutateAsync({
        expenseId: draft.expenseId,
        file: proofFile,
      });

      await submitExpense.mutateAsync(draft.expenseId);
      setSubmitMessageTone("success");
      setSubmitMessage("Expense submitted successfully!");
      expenseForm.reset();
      await myExpenses?.refetch();
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.error ||
          (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.message
        : undefined;
      setSubmitMessageTone("error");
      setSubmitMessage(
        apiMessage || "Unable to submit expense. Please try again.",
      );
    }
  };

  const handleStartEditDraft = (expenseId: number) => {
    const expense = list?.find((item: Expense) => item.expenseId === expenseId);
    if (!expense) return;

    setEditingDraftId(expenseId);
    setDraftEdits((prev) => ({
      ...prev,
      [expenseId]: {
        categoryId: expense.categoryId,
        amount: expense.amount,
        currency: expense.currency,
        expenseDate: expense.expenseDate,
      },
    }));
  };

  const handleUpdateDraftField = (
    expenseId: number,
    field: keyof DraftEditValues,
    value: string | number,
  ) => {
    setDraftEdits((prev) => ({
      ...prev,
      [expenseId]: {
        ...prev[expenseId],
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = async (expenseId: number) => {
    const payload = draftEdits[expenseId];
    if (!payload) return;

    if (
      !payload.categoryId ||
      !payload.amount ||
      !payload.currency ||
      !payload.expenseDate
    ) {
      setDraftMessage(expenseId, "Complete all draft fields before saving.");
      return;
    }

    try {
      await updateDraft.mutateAsync({
        expenseId,
        categoryId: Number(payload.categoryId),
        amount: Number(payload.amount),
        currency: payload.currency,
        expenseDate: payload.expenseDate,
      });

      setEditingDraftId(null);
      setDraftMessage(expenseId, "Draft saved successfully.");
      await myExpenses?.refetch();
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.error ||
          (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.message
        : undefined;
      setDraftMessage(
        expenseId,
        apiMessage || "Unable to save draft. Please try again.",
      );
    }
  };

  const handleDeleteDraftExpense = async (expenseId: number) => {
    if (!globalThis.confirm("Delete this draft expense?")) return;

    try {
      await deleteDraft.mutateAsync(expenseId);
      await myExpenses?.refetch();
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };

  const handleUploadProofOnly = async (expenseId: number) => {
    const file = draftFiles[expenseId];
    if (!file) return;

    try {
      await uploadProof.mutateAsync({ expenseId, file });
      setDraftFiles((prev) => ({ ...prev, [expenseId]: null }));
      setDraftMessage(expenseId, "Proof uploaded successfully.");
      await myExpenses?.refetch();
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.error ||
          (
            error.response?.data as
              | { error?: string; message?: string }
              | undefined
          )?.message
        : undefined;
      setDraftMessage(
        expenseId,
        apiMessage || "Unable to upload proof. Please try again.",
      );
    }
  };

  const handleDeleteProofFile = async (expenseId: number, proofId: number) => {
    try {
      if (!globalThis.confirm("Delete this proof?")) return;
      await deleteProof.mutateAsync({ expenseId, proofId });
      await myExpenses?.refetch();
    } catch (error) {
      console.error("Error deleting proof:", error);
    }
  };

  const handleReview = async (
    expenseId: number,
    formValues: ReviewFormValues,
  ) => {
    try {
      await reviewExpense.mutateAsync({
        expenseId,
        remarks: formValues.remarks,
        status: formValues.status,
      });
      await hrExpenses.refetch();
    } catch (error) {
      console.error("Error reviewing expense:", error);
    }
  };

  const setDraftMessage = (expenseId: number, message: string) => {
    setDraftMessages((prev) => ({ ...prev, [expenseId]: message }));
  };

  return (
    <section className="space-y-4">
      <Header
        title="Expenses"
        description="Manage your expense submissions and track approvals."
      />

      {/* Employee submission form */}
      {isEmployee ? (
        <Card className="max-w-3xl p-4">
          <ExpenseSubmitForm
            form={expenseForm}
            onSubmit={handleCreateExpense}
            categories={categoriesQuery.data}
            assignments={assignmentsQuery.data}
            isLoading={assignmentsQuery.isLoading}
            isSubmitting={
              createDraft.isPending ||
              uploadProof.isPending ||
              submitExpense.isPending
            }
            submitMessage={submitMessage}
            submitMessageTone={submitMessageTone}
          />
        </Card>
      ) : null}

      {/* HR filter panel */}
      {isHr ? (
        <ExpenseFiltersPanel
          control={filterForm.control}
          register={filterForm.register}
          employeeOptions={employeeOptions}
          onSearch={setSearchQuery}
          isLoadingOptions={employeesQuery.isLoading}
        />
      ) : null}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner /> Loading expenses...
        </div>
      ) : null}

      {/* Error state */}
      {isError ? (
        <Card>
          <p className="text-sm text-red-600">
            Unable to load expenses right now.
          </p>
        </Card>
      ) : null}

      {/* Expense list */}
      {list?.length ? (
        <div className={`grid gap-3  md:grid-cols-2 xl:grid-cols-3`}>
          {list.map((expense: Expense) => (
            <ExpenseListItem
              key={expense.expenseId}
              expense={expense}
              isHr={isHr}
              isEmployee={isEmployee}
              onReview={handleReview}
              reviewPending={reviewExpense.isPending}
            >
              {/* Draft actions panel */}
              {isEmployee && expense.status === "Draft" ? (
                <DraftActions
                  expenseId={expense.expenseId}
                  isEditing={editingDraftId === expense.expenseId}
                  editValues={draftEdits[expense.expenseId] || {}}
                  draftMessage={draftMessages[expense.expenseId]}
                  categories={categoriesQuery.data}
                  proofs={expense.proofs}
                  draftFile={draftFiles[expense.expenseId] || null}
                  onStartEdit={() => handleStartEditDraft(expense.expenseId)}
                  onFieldChange={(field, value) =>
                    handleUpdateDraftField(expense.expenseId, field, value)
                  }
                  onSaveDraft={() => handleSaveDraft(expense.expenseId)}
                  onCancelEdit={() => setEditingDraftId(null)}
                  onDeleteDraft={() =>
                    handleDeleteDraftExpense(expense.expenseId)
                  }
                  onUploadProof={() => handleUploadProofOnly(expense.expenseId)}
                  onDeleteProof={(proofId) =>
                    handleDeleteProofFile(expense.expenseId, proofId)
                  }
                  onFilePicked={(file) =>
                    setDraftFiles((prev) => ({
                      ...prev,
                      [expense.expenseId]: file,
                    }))
                  }
                  isUploadingProof={uploadProof.isPending}
                  isSubmitting={submitExpense.isPending}
                  isSaving={updateDraft.isPending}
                  isDeleting={deleteDraft.isPending}
                />
              ) : null}
            </ExpenseListItem>
          ))}
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading && !isError && !list?.length ? (
        <EmptyState
          title="No expenses yet"
          description="Expenses will appear here once submitted."
        />
      ) : null}
    </section>
  );
};
