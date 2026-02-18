using backend.Data;
using backend.DTO.Common;
using backend.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Common
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;

        public UserRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<int> AddUserAsync(User user)
        {
            _db.Users.Add(user);
            return await _db.SaveChangesAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email);

        }

        public async Task<User?> GetByIdAsync(long userId)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<UserResponseDto?> GetUserProfileAsync(long userId)
        {
            return await _db.Users
                .Include(u => u.Role)
                .Include(u => u.Manager)
                .Where(u => u.UserId == userId)
                .Select(u => new UserResponseDto(
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.Phone,
                    u.DateOfBirth,
                    u.DateOfJoining,
                    u.ProfilePhotoUrl,
                    u.Department,
                    u.Designation,
                    u.Manager != null ? u.Manager.FullName : null,
                    u.Role != null ? u.Role.Name : null
                ))
                .FirstOrDefaultAsync();
        }

        public async Task<List<OrgChartUserDto>> GetOrgChartUsersAsync()
        {
            return await _db.Users
                .OrderBy(u => u.FullName)
                .Select(u => new OrgChartUserDto(
                    u.UserId,
                    u.FullName,
                    u.Email,
                    u.Department,
                    u.Designation,
                    u.ProfilePhotoUrl,
                    u.ManagerId
                ))
                .ToListAsync();
        }



        public async Task<List<UserResponseDto>> GetListOfEmployeeAsync()
        {
            return _db.Users.Join(_db.Roles,
         u => EF.Property<long?>(u, "RoleId"),
         r => EF.Property<long?>(r, "RoleId"),
         (o, i) => new { User = o, Role = i }).Join(
        _db.Users,
        ur => EF.Property<long?>(ur.User, "ManagerId"),
        m => EF.Property<long?>(m, "UserId"),
        (ur, manager) => new
        {
            ur.User,
            ur.Role,
            ManagerName = manager.FullName
        }
    )
     .Where(u => u.Role != null)
     .AsEnumerable()
     .OrderBy(u => u.User.FullName).Select(u => new UserResponseDto(
         u.User.UserId,
         u.User.FullName,
         u.User.Email,
         u.User.Phone,
         u.User.DateOfBirth,
         u.User.DateOfJoining,
         u.User.ProfilePhotoUrl,
         u.User.Department,
         u.User.Designation,
         u.ManagerName,
         u.Role.Name
     ))
     .ToList();
        }

        public async Task<object> SearchEmployeeAsync(string trimmed)
        {
            return _db.Users.Join(
            _db.Roles,
            u => EF.Property<long?>(u, "RoleId")!,
            r => EF.Property<long?>(r, "RoleId")!,
            (u, r) => new { User = u, Role = r }
            )
            .Where(ti => ti.User.FullName.ToLower().Contains(trimmed.ToLower()) ||
                ti.User.Email.ToLower().Contains(trimmed.ToLower()))
            .OrderBy(ti => ti.User.FullName)
            .Select(ti => new EmployeeLookupDto(ti.User.UserId, ti.User.FullName, ti.User.Email))
             .ToList();
        }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }

        public async Task<IReadOnlyCollection<long>> GetExistingUserIdsAsync(IReadOnlyCollection<long> userIds)
        {
            return await _db.Users.Where(u => userIds.Contains(u.UserId)).Select(u => u.UserId).ToListAsync();
        }

        public async Task<IReadOnlyCollection<User>> GetUsersByIdsAsync(IReadOnlyCollection<long> userIds)
        {
            return await _db.Users.Where(u => userIds.Contains(u.UserId)).ToListAsync();
        }
        public async Task<IReadOnlyCollection<User>> GetUsersByRoleIdAsync(long roleId)
        {
            return await _db.Users.Where(u=> u.RoleId == roleId).ToListAsync();
        }
        public async Task<Dictionary<long,string>> GetUsersNamesByIdsAsync(IReadOnlyCollection<long> userIds)
        {
            return await _db.Users.Where(u=> userIds.Contains(u.UserId)).Select(u=> new {u.UserId,u.FullName}).ToDictionaryAsync(u=> u.UserId,u=> u.FullName);
        }

        public async Task<string?> GetUserFullNameAsync(long userId)
        {
            return await _db.Users.Where(u => u.UserId == userId).Select(u => u.FullName).FirstOrDefaultAsync();
        }

        public async Task<bool> IsTeamMemberAsync(long managerId,long employeeId)
        {
            return await _db.Users.AnyAsync(u => u.UserId == employeeId && u.ManagerId == managerId);
        }

    }
}