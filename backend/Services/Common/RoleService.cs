using backend.Repositories.Common;
using backend.DTO.Common;



namespace backend.Services.Common
{
    public class RoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<RoleResponseDto> CreateRoleAsync(RoleCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Role name cannot be empty.");
            }

            return await _roleRepository.CreateRoleAsync(dto);
        }

        public async Task<IReadOnlyCollection<RoleResponseDto>> GetAllRolesAsync()
        {
            return await _roleRepository.GetRolesAsync();
        }

        public async Task<RoleResponseDto> GetRoleById(long roleId)
        {
            return await _roleRepository.GetRoleByIdAsync(roleId);
        }
    }
}