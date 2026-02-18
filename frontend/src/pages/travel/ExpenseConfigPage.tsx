import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Header } from "../../components/Header";
import { Spinner } from "../../components/ui/Spinner";
import { useExpenseCategories } from "../../hooks/travel/useExpenseConfig";
import {
  useCreateExpenseCategory,
} from "../../hooks/travel/useExpenseConfigMutations";

type CategoryFormValues = {
  categoryName: string;
  maxAmountPerDay: number;
};



export const ExpenseConfigPage = () => {
  const [message, setMessage] = useState("");
  const categoriesQuery = useExpenseCategories();
  const createCategory = useCreateExpenseCategory();

  const {
    register: registerCategory,
    handleSubmit: submitCategory,
    reset: resetCategory,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      categoryName: "",
      maxAmountPerDay: undefined,
    },
  });



  const handleCreateCategory = async (values: CategoryFormValues) => {
    setMessage("");
    await createCategory.mutateAsync({
      categoryName: values.categoryName,
      maxAmountPerDay: Number(values.maxAmountPerDay),
    });
    await categoriesQuery.refetch();
    resetCategory();
    setMessage("Category created successfully.");
  };

  return (
    <section className="space-y-6">
      <Header
        title="Expense configuration"
        description="Manage expense categories and validation rules."
      />

      {message ? (
        <Card>
          <p className="text-sm text-emerald-600">{message}</p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Create category
            </h3>
            <p className="text-xs text-slate-500">
              Define per-day limits for expense categories.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={submitCategory(handleCreateCategory)}
          >
            <Input
              label="Category name"
              error={categoryErrors.categoryName?.message}
              {...registerCategory("categoryName", {
                required: "Category name is required.",
              })}
            />
            <Input
              label="Max amount per day"
              type="number"
              step="0.01"
              error={categoryErrors.maxAmountPerDay?.message}
              {...registerCategory("maxAmountPerDay", {
                required: "Max amount is required.",
                valueAsNumber: true,
                min: { value: 0.01, message: "Amount must be positive." },
              })}
            />
            <button
              type="submit"
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold bg-(--color-primary) hover:bg-brand-700 disabled:opacity-70"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Saving..." : "Create category"}
            </button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900">
            Existing categories
          </h3>
          {categoriesQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spinner /> Loading categories...
            </div>
          ) : null}
          {categoriesQuery.isError ? (
            <p className="text-sm text-red-600">
              Unable to load categories right now.
            </p>
          ) : null}
          {categoriesQuery.data?.length ? (
            <div className="space-y-2">
              {categoriesQuery.data.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <span>{category.categoryName}</span>
                  <span className="text-slate-500">
                    Max {category.maxAmountPerDay}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          {!categoriesQuery.isLoading &&
          !categoriesQuery.isError &&
          !categoriesQuery.data?.length ? (
            <EmptyState
              title="No categories"
              description="Create your first expense category."
            />
          ) : null}
        </Card>
      </div>
    </section>
  );
};
