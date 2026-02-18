using backend.Data;
using backend.Entities.Travels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Travels;

public class ExpenseCategoryRepository : IExpenseCategoryRepository
{
    private readonly AppDbContext _db;

    public ExpenseCategoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ExpenseCategory> AddCategoryAsync(ExpenseCategory category)
    {
        _db.ExpenseCategories.Add(category);
        await _db.SaveChangesAsync();
        return category;
    }

    public async Task<IReadOnlyCollection<ExpenseCategory>> GetCategoriesAsync()
    {
        return await _db.ExpenseCategories
            .OrderBy(c => c.CategoryName)
            .ToListAsync();
    }

    public async Task<bool> CategoryExistsAsync(string categoryName)
    {
        return await _db.ExpenseCategories.AnyAsync(c=> c.CategoryName == categoryName);
    }

    public async Task<decimal?> GetMaxAmountPerDayAsync(long categoryId)
    {
        return await _db.ExpenseCategories.Where(c=> c.CategoryId == categoryId).Select(c => c.MaxAmountPerDay).FirstOrDefaultAsync();
    }
}