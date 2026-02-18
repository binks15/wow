using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Common
{

    public record RegisterRequest(
        [Required, EmailAddress, RegularExpression("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$", ErrorMessage = "Email must be lowercase.")] string Email,
        [Required, MinLength(8)] string Password,
        [Required, MaxLength(200)] string FullName,
        [Required] long RoleId
    );

    public record RegisterResponse(
        [Required] long UserId,
        [Required] string Email,
        [Required] string FullName,
        [Required] string Role
    );

    public record LoginRequest(
        [Required, EmailAddress] string Email,
        [Required] string Password
    );

    public record RefreshRequest(
        [Required] string RefreshToken
    );

    public record AuthResponse(
        string AccessToken,
        DateTime AccessTokenExpiresAt
    // string RefreshToken,
    // DateTime RefreshTokenExpiresAt
    );

}