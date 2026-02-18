using backend.DTO.Travels;
using backend.Repositories.Travels;
 
namespace backend.Services.Travels;
 
public class ManagerService
{
    private readonly IManagerRepository _repo;
 
    public ManagerService(IManagerRepository repo)
    {
        _repo = repo;
    }
 
    public async Task<IReadOnlyCollection<TeamMemberDto>> GetTeamMembersAsync(long managerId)
    {
        return await _repo.GetTeamMembersAsync(managerId);
    }
 
    public async Task<IReadOnlyCollection<TeamExpenseDto>> GetTeamExpensesAsync(long managerId, DateTime? from, DateTime? to)
    {
        return await _repo.GetTeamExpensesAsync(managerId, from, to);
    }
}
 