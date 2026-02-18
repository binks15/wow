using backend.DTO.Common;
using backend.Entities.Common;
using backend.Repositories.Common;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Common
{
    public class UserService
    {
        private readonly IUserRepository _repo;
        private readonly CloudinaryService _cloudinary;

        public UserService(IUserRepository userRepository, CloudinaryService cloudinaryService)
        {
            _repo = userRepository;
            _cloudinary = cloudinaryService;
        }

        public async Task<int> AddUser(User user)
        {
            return await _repo.AddUserAsync(user);

        }
        public async Task<User?> GetUserByEmail(string email)
        {
            return await _repo.GetUserByEmailAsync(email);

        }

        public async Task<List<UserResponseDto>> GetListOfEmployee()
        {
            return await _repo.GetListOfEmployeeAsync();
        }

        public async Task<UserResponseDto?> GetUserProfileAsync(long userId)
        {
            return await _repo.GetUserProfileAsync(userId);
        }

        public async Task<UserResponseDto?> UpdateUserProfileAsync(long userId, UserProfileUpdateDto dto)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user is null)
            {
                return null;
            }

            if (dto.FullName is not null)
            {
                user.FullName = dto.FullName;
            }

            if (dto.Phone is not null)
            {
                user.Phone = dto.Phone;
            }

            if (dto.DateOfBirth.HasValue)
            {
                user.DateOfBirth = dto.DateOfBirth.Value;
            }

            if (dto.ProfilePhotoUrl is not null)
            {
                user.ProfilePhotoUrl = dto.ProfilePhotoUrl;
            }

            if (dto.Department is not null)
            {
                user.Department = dto.Department;
            }

            if (dto.Designation is not null)
            {
                user.Designation = dto.Designation;
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _repo.SaveAsync();

            return await _repo.GetUserProfileAsync(userId);
        }

        public async Task<OrgChartNodeDto> GetOrgChartAsync(long userId)
        {
            var users = await _repo.GetOrgChartUsersAsync();
            var nodes = users.ToDictionary(
                user => user.Id,
                user => new OrgChartNodeDto(
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Department,
                    user.Designation,
                    user.ProfilePhotoUrl,
                    user.ManagerId,
                    new List<OrgChartNodeDto>()
                )
            );

            foreach (var node in nodes.Values)
            {
                if (node.ManagerId.HasValue && nodes.TryGetValue(node.ManagerId.Value, out var managerNode))
                {
                    managerNode.DirectReports.Add(node);
                }
            }

            foreach (var node in nodes.Values)
            {
                node.DirectReports.Sort((left, right) => string.Compare(left.FullName, right.FullName, StringComparison.Ordinal));
            }

            if (!nodes.TryGetValue(userId, out var selectedNode))
            {
                throw new ArgumentException("User not found.");
            }

            var current = selectedNode;
            while (current.ManagerId.HasValue && nodes.TryGetValue(current.ManagerId.Value, out var managerNode))
            {
                current = managerNode;
            }

            return current;
        }

        public async Task<UserResponseDto?> UpdateProfilePhotoAsync(long userId, IFormFile file)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user is null)
            {
                return null;
            }

            var upload = await _cloudinary.UploadAsync(file, "profile-photos");
            user.ProfilePhotoUrl = upload.Url;
            user.UpdatedAt = DateTime.UtcNow;

            await _repo.SaveAsync();
            return await _repo.GetUserProfileAsync(userId);
        }

        public async Task<object> SearchEmployee(string trimmed)
        {
            return await _repo.SearchEmployeeAsync(trimmed);
        }

    }
}