using backend.Entities.Common;

namespace backend.Repositories.Common;

public interface IAuthRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task<int> AddUserRefreshTokenAsync(UserRefreshToken refreshToken);
    Task<UserRefreshToken?> GetUserByHashTokenAsync(string tokenHash);
    // Task<int?> UpdateRevokedAtAsync(UserRefreshToken userRefreshToken);

    Task SaveAsync();
}