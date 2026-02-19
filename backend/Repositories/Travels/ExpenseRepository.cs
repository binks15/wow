using backend.Data;
using backend.Entities.Travels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Travels;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _db;

    public ExpenseRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Expense> AddAsync(Expense expense)
    {
        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();
        return expense;
    }

    public async Task<Expense?> GetByIdAsync(long expenseId)
    {
        return await _db.Expenses
            // .Include(e => e.Assignment)
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Reviewer)
            .Include(e => e.ProofDocuments)
            .FirstOrDefaultAsync(e => e.ExpenseId == expenseId);
    }

    public async Task<IReadOnlyCollection<Expense>> GetByAssigneeAsync(long employeeId)
    {
        return await _db.Expenses
            // .Include(e => e.Assignment)
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Reviewer)
            .Include(e => e.ProofDocuments)
            .Where(e => e.EmployeeId == employeeId)
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<Expense>> GetFilteredAsync(long? employeeId, long? travelId, DateTime? from, DateTime? to, string? status, long? createdById)
    {
        var query = _db.Expenses
            // .Include(e => e.Assignment)
            .Include(e => e.Employee)
            .Include(e => e.Category)
            .Include(e => e.Reviewer)
            .Include(e => e.ProofDocuments)
            .AsQueryable();

        if (employeeId.HasValue)
        {
            query = query.Where(e => e.EmployeeId == employeeId.Value);
        }

        if (travelId.HasValue)
        {
            query = query.Where(e => e.TravelId == travelId.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(e => e.ExpenseDate >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(e => e.ExpenseDate <= to.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ExpenseStatus>(status, true, out var parsed))
        {
            query = query.Where(e => e.Status == parsed);
        }

        if (createdById.HasValue)
        {
            query = query.Where(e => _db.Travels.Any(t => t.TravelId == e.TravelId && t.CreatedBy == createdById.Value));
        }

        return await query
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalClaimedAmountAsync(long travelId)
    {
        return await _db.Expenses.Where(e => e.TravelId == travelId).Select(e => (decimal?)e.Amount).SumAsync() ?? 0m;
    }

    public async Task DeleteAsync(Expense expense)
    {
        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
}