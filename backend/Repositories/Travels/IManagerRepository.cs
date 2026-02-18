using backend.DTO.Travels;

namespace backend.Repositories.Travels;

public interface IManagerRepository
{
    Task<IReadOnlyCollection<TeamMemberDto>> GetTeamMembersAsync(long managerId);
    Task<IReadOnlyCollection<TeamExpenseDto>> GetTeamExpensesAsync(long managerId, DateTime? from, DateTime? to);
}