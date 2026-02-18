using backend.Entities.Travels;

namespace backend.Repositories.Travels;

public interface IExpenseCategoryRepository
{
    Task<ExpenseCategory> AddCategoryAsync(ExpenseCategory category);
    Task<IReadOnlyCollection<ExpenseCategory>> GetCategoriesAsync();

    Task <bool> CategoryExistsAsync(string categoryName);

    Task<decimal?> GetMaxAmountPerDayAsync(long categoryId);

}