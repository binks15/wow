using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Entities.Common;
using backend.Repositories.Common;

namespace backend.Services.Common
{

    public class AuthService 
    {
        private readonly IAuthRepository _authRepo;

        public AuthService(IAuthRepository authRepository)
        {
            _authRepo = authRepository;
        }


        public async Task<bool> ExistsByEmail(string email)
        {
            return await _authRepo.ExistsByEmailAsync(email);
        }

        public async Task<int> AddUserRefreshToken(UserRefreshToken refreshToken)
        {
            return await _authRepo.AddUserRefreshTokenAsync(refreshToken);
        }

        public async Task<UserRefreshToken?> GetUserByHashToken(string tokenHash)
        {
            return await _authRepo.GetUserByHashTokenAsync(tokenHash);
        }

        public async Task UpdateRevokedAtAsync(UserRefreshToken userRefreshToken)
        {
            userRefreshToken.RevokedAt = DateTime.UtcNow;
             await _authRepo.SaveAsync();
        }

        public long? GetUserId(ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue("user_id");
            if (long.TryParse(sub, out var userId))
            {
                return userId;
            }

            return null;
        }


    }
}