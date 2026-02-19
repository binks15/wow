import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Header } from "../../components/Header";
import { Spinner } from "../../components/ui/Spinner";
import { useExpenseCategories } from "../../hooks/travel/useExpenseConfig";
import type { ExpenseCategory } from "../../types/expense-config";
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
        <Card className="max-w-2xl">
          <p className="text-sm text-emerald-600">{message}</p>
        </Card>
      ) : null}

      <div>
        <Card className="max-w-2xl space-y-4 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Create category
            </h3>
            <p className="text-xs text-slate-500">
              Define per-day limits for expense categories.
            </p>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={submitCategory(handleCreateCategory)}
          >
            <Input
              label="Category name"
              placeholder="e.g. Food"
              error={categoryErrors.categoryName?.message}
              {...registerCategory("categoryName", {
                required: "Category name is required.",
                validate: (value: string) =>
                  value.trim().length > 0 || "Category name is required.",
              })}
            />
            <Input
              label="Max amount per day"
              type="number"
              step="0.01"
              placeholder="e.g. 1500"
              error={categoryErrors.maxAmountPerDay?.message}
              {...registerCategory("maxAmountPerDay", {
                required: "Max amount is required.",
                valueAsNumber: true,
                min: { value: 0.01, message: "Amount must be positive." },
              })}
            />
            <div className="sm:col-span-2 sm:flex sm:justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Saving..." : "Create category"}
            </Button>
            </div>
          </form>
        </Card>
      </div>

      <div>
        <Card className="space-y-3 p-4">
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
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(240px,320px))] justify-center sm:justify-start">
              {categoriesQuery.data.map((category: ExpenseCategory) => (
                <div
                  key={category.categoryId}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{category.categoryName}</p>
                  <p className="mt-1 text-xs text-slate-500">Max per day: {category.maxAmountPerDay}</p>
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