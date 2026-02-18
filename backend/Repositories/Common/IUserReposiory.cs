using backend.DTO.Common;
using backend.Entities.Common;

namespace backend.Repositories.Common;


public interface IUserRepository
{
    Task<int> AddUserAsync(User user);

    Task<User?> GetUserByEmailAsync(string email);

    Task<User?> GetByIdAsync(long userId);

    Task<UserResponseDto?> GetUserProfileAsync(long userId);

    Task<List<OrgChartUserDto>> GetOrgChartUsersAsync();


    Task<List<UserResponseDto>> GetListOfEmployeeAsync();

    Task SaveAsync();

    Task<object> SearchEmployeeAsync(string trimmed);

    Task<IReadOnlyCollection<long>> GetExistingUserIdsAsync(IReadOnlyCollection<long> userIds);
    Task<IReadOnlyCollection<User>> GetUsersByIdsAsync(IReadOnlyCollection<long> userIds);
    Task<IReadOnlyCollection<User>> GetUsersByRoleIdAsync(long roleId);
    Task<Dictionary<long,string>> GetUsersNamesByIdsAsync(IReadOnlyCollection<long> userId);
    Task<string?> GetUserFullNameAsync(long userId);
    Task<bool> IsTeamMemberAsync(long managerId,long employeeId);
}
