import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
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
  useCreateExpense,
  useSubmitExpense,
  useUploadExpenseProof,
} from "../../hooks/travel/useExpenseMutations";
import { type ReviewFormValues } from "../../components/Review";
import { useReviewExpense } from "../../hooks/travel/useExpenseReview";
import { useCreatedTravels, useTravelAssignments } from "../../hooks/travel/useTravel";
import {
  ExpenseSubmitForm,
  type ExpenseFormValues,
} from "../../components/travel/ExpenseSubmitForm";
import {
  ExpenseListItem,
  type Expense,
} from "../../components/travel/ExpenseListItem";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    const travelParam = searchParams.get("travelId");
    const employeeParam = searchParams.get("employeeId");

    if (travelParam) {
      filterForm.setValue("travelId", Number(travelParam));
    }

    if (employeeParam) {
      filterForm.setValue("employeeId", Number(employeeParam));
    }
  }, [filterForm, searchParams]);

  // Data fetching
  const filters = filterForm.watch();
  const normalizedFilters: ExpenseQueryFilters = {
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
    travelId: filters.travelId ? Number(filters.travelId) : undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };
  const isValidFilterRange =
    !normalizedFilters.from ||
    !normalizedFilters.to ||
    new Date(normalizedFilters.from) <= new Date(normalizedFilters.to);

  const myExpenses = isHr ? null : useMyExpenses();
  const hrExpenses = useHrExpenses(normalizedFilters, isHr && isValidFilterRange);
  const categoriesQuery = useExpenseCategories();
  const assignmentsQuery = useTravelAssignments(undefined, isEmployee);
  const createdTravelsQuery = useCreatedTravels(isHr);
  const employeesQuery = useEmployeeSearch(
    searchQuery,
    isHr && searchQuery.length >= 2,
  );
  const employeeOptions = employeesQuery.data ?? [];

  // Mutations
  const createExpense = useCreateExpense();
  const uploadProof = useUploadExpenseProof();
  const submitExpense = useSubmitExpense();
  const reviewExpense = useReviewExpense();

  // Derived state
  const list = isHr ? hrExpenses.data : myExpenses?.data;
  const isLoading = isHr ? hrExpenses.isLoading : myExpenses?.isLoading;
  const isError = isHr ? hrExpenses.isError : myExpenses?.isError;
  const hrPendingExpenses = isHr
    ? (list ?? []).filter((expense: Expense) => expense.status === "Submitted")
    : [];
  const hrReviewedExpenses = isHr
    ? (list ?? []).filter((expense: Expense) => expense.status !== "Submitted")
    : [];
  const expenseGridClass =
    "grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,320px))] justify-center sm:justify-start";

  // Handlers
  const handleCreateExpense = async (values: ExpenseFormValues) => {
    setSubmitMessage("");
    setSubmitMessageTone("success");

    if (!values.assignId || Number(values.assignId) <= 0) {
      setSubmitMessageTone("error");
      setSubmitMessage("Please select an assignment.");
      return;
    }

    if (!values.categoryId || Number(values.categoryId) <= 0) {
      setSubmitMessageTone("error");
      setSubmitMessage("Please select a category.");
      return;
    }

    if (!values.amount || Number(values.amount) <= 0) {
      setSubmitMessageTone("error");
      setSubmitMessage("Amount must be greater than 0.");
      return;
    }

    if (!/^[A-Za-z]{3}$/.test(values.currency?.trim() ?? "")) {
      setSubmitMessageTone("error");
      setSubmitMessage("Use a valid 3-letter currency code.");
      return;
    }

    const proofFile = values.proof?.item(0);
    if (!proofFile) {
      setSubmitMessageTone("error");
      setSubmitMessage("Please attach a proof file before submitting.");
      return;
    }

    try {
      const createdExpense = await createExpense.mutateAsync({
        assignId: values.assignId!,
        categoryId: values.categoryId,
        amount: values.amount,
        currency: values.currency,
        expenseDate: values.expenseDate,
      });

      await uploadProof.mutateAsync({
        expenseId: createdExpense.expenseId,
        file: proofFile,
      });

      await submitExpense.mutateAsync(createdExpense.expenseId);
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

  const renderExpenseCard = (expense: Expense) => (
    <ExpenseListItem
      key={expense.expenseId}
      expense={expense}
      isHr={isHr}
      isEmployee={isEmployee}
      onReview={handleReview}
      reviewPending={reviewExpense.isPending}
    />
  );

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
              createExpense.isPending ||
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
        <>
          <ExpenseFiltersPanel
            control={filterForm.control}
            register={filterForm.register}
            employeeOptions={employeeOptions}
            travelOptions={createdTravelsQuery.data ?? []}
            onSearch={setSearchQuery}
            isLoadingOptions={employeesQuery.isLoading}
          />
          {!isValidFilterRange ? (
            <p className="text-sm text-red-600">From date must be on or before To date.</p>
          ) : null}
        </>
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
      {list?.length && isHr ? (
        <div className="space-y-5">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Pending Review
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {hrPendingExpenses.length}
              </span>
            </div>
            {hrPendingExpenses.length ? (
              <div className={expenseGridClass}>
                {hrPendingExpenses.map((expense: Expense) =>
                  renderExpenseCard(expense),
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No pending expenses to review.</p>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Reviewed</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {hrReviewedExpenses.length}
              </span>
            </div>
            {hrReviewedExpenses.length ? (
              <div className={expenseGridClass}>
                {hrReviewedExpenses.map((expense: Expense) =>
                  renderExpenseCard(expense),
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No reviewed expenses yet.</p>
            )}
          </Card>
        </div>
      ) : null}

      {list?.length && !isHr ? (
        <div className={expenseGridClass}>
          {list.map((expense: Expense) => renderExpenseCard(expense))}
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