using backend.Data;
using backend.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Common
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _db;

        public AuthRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _db.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<int> AddUserRefreshTokenAsync(UserRefreshToken refreshtoken)
        {
            _db.UserRefreshTokens.Add(refreshtoken);
            return await _db.SaveChangesAsync();
        }

        public async Task<UserRefreshToken?> GetUserByHashTokenAsync(string tokenHash)
        {
            return await _db.UserRefreshTokens
            .Include(t => t.User)
            .ThenInclude(u => u!.Role)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);
        }

//maybe not needed
        // public async Task<int?> UpdateRevokedAtAsync(UserRefreshToken userRefreshToken)
        // {
        //     userRefreshToken.RevokedAt = DateTime.UtcNow;
        //     return await _db.SaveChangesAsync();
        // }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }


    }
}