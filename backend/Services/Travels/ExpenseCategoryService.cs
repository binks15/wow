using backend.Entities.Travels;
using backend.DTO.Travels;
using backend.Repositories.Travels;
 
namespace backend.Services.Travels;
 
public class ExpenseCategoryService
{
    private readonly IExpenseCategoryRepository _repo;
 
    public ExpenseCategoryService(IExpenseCategoryRepository repo)
    {
        _repo = repo;
    }
 
    public async Task<ExpenseCategoryResponseDto> CreateCategoryAsync(ExpenseCategoryCreateDto dto)
    {
        var exists = await _repo.CategoryExistsAsync(dto.CategoryName!);
        if (exists)
        {
            throw new ArgumentException("Category already exists.");
        }
 
        var category = new ExpenseCategory
        {
            CategoryName = dto.CategoryName,
            MaxAmountPerDay = dto.MaxAmountPerDay
        };
 
        var saved = await _repo.AddCategoryAsync(category);
        return new ExpenseCategoryResponseDto(saved.CategoryId, saved.CategoryName, saved.MaxAmountPerDay);
    }
 
    public async Task<IReadOnlyCollection<ExpenseCategoryResponseDto>> GetCategoriesAsync()
    {
        var categories = await _repo.GetCategoriesAsync();
        return categories.Select(c => new ExpenseCategoryResponseDto(c.CategoryId, c.CategoryName, c.MaxAmountPerDay)).ToList();
    }
 
}
 