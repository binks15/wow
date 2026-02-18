using backend.Data;
using backend.DTO.Travels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Travels;

public class ManagerRepository : IManagerRepository
{
    private readonly AppDbContext _db;

    public ManagerRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<TeamMemberDto>> GetTeamMembersAsync(long managerId)
    {
        return await _db.Users
            .Where(u => u.ManagerId == managerId)
            .Select(u => new TeamMemberDto(u.UserId, u.FullName, u.Email, u.Department, u.Designation))
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<TeamExpenseDto>> GetTeamExpensesAsync(long managerId, DateTime? from, DateTime? to)
    {
        var query = _db.Expenses
            .Include(e => e.Employee)
            .Where(e => e.Employee!.ManagerId == managerId)
            .AsQueryable();

        if (from.HasValue)
        {
            query = query.Where(e => e.ExpenseDate >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(e => e.ExpenseDate <= to.Value);
        }

        return await query
            .OrderByDescending(e => e.ExpenseDate)
            .Select(e => new TeamExpenseDto(
                e.ExpenseId,
                e.Employee!.UserId,
                e.Travel!.TravelId,
                e.CategoryId,
                e.Amount,
                e.Currency,
                e.ExpenseDate,
                e.Status.ToString()
            ))
            .ToListAsync();
    }
}