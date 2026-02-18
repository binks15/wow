import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../config/axios";
import type { ExpenseCategory } from "../../types/expense-config";

type CreateCategoryPayload = {
  categoryName: string;
  maxAmountPerDay: number;
};

export const useCreateExpenseCategory = () =>
  useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await apiClient.post<ExpenseCategory>(
        "/api/v1/expense-config/categories",
        payload,
      );
      return response.data;
    },
  });
