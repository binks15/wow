using backend.Entities.Travels;

namespace backend.Repositories.Travels;

public interface IExpenseRepository
{
  Task<Expense> AddAsync(Expense expense);
  Task<Expense?> GetByIdAsync(long expenseId);
  Task<IReadOnlyCollection<Expense>> GetByAssigneeAsync(long employeeId);
  Task<IReadOnlyCollection<Expense>> GetFilteredAsync(long? employeeId, long? travelId, DateTime? from, DateTime? to, string? status, long? createdById);
  Task<decimal> GetTotalClaimedAmountAsync(long travelId);
  Task DeleteAsync(Expense expense);
  Task SaveAsync();
}