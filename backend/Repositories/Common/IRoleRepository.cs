using backend.DTO.Common;

namespace backend.Repositories.Common;


public interface IRoleRepository
{
    Task<RoleResponseDto> CreateRoleAsync(RoleCreateDto dto);
    Task<IReadOnlyCollection<RoleResponseDto>> GetRolesAsync();
    Task<RoleResponseDto> GetRoleByIdAsync(long roleId);
    Task<long?> GetRoleIdByNameAsync(string roleName);
}
