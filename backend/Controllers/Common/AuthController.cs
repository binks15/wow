using backend.Config;
using backend.Entities.Common;
using backend.DTO.Common;
using backend.Services.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using backend.Services.Common;
 
namespace backend.Controllers.Common;
 
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly PasswordHasher _hasher;
    private readonly TokenService _tokenService;
    private readonly IOptions<JwtSettings> _jwtSettings;
 
    private readonly AuthService _authService;
    private readonly RoleService _roleService;
    private readonly UserService _userService;
    public AuthController(PasswordHasher hasher, TokenService tokenService, IOptions<JwtSettings> jwtSettings, AuthService authService, RoleService roleService, UserService userService)
    {
        _hasher = hasher;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings;
        _authService = authService;
        _roleService = roleService;
        _userService = userService;
    }
 
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
 
        var exists = await _authService.ExistsByEmail(request.Email);
        if (exists)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Email already registered."
            });
        }
        //done
        var role = await _roleService.GetRoleById(request.RoleId);
        if (role is null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Role not found."
            });
        }
 
        var (hash, salt) = _hasher.HashPassword(request.Password);
        var user = new User
        {
            Email = request.Email,
            Password = hash,
            PasswordSalt = salt,
            FullName = request.FullName,
            RoleId = role.RoleId
        };
        //done
        await _userService.AddUser(user);
 
        var registerResponse = new RegisterResponse(user.UserId,
         user.Email, user.FullName, role.Name);
 
 
        return Created(string.Empty, new ApiResponse<RegisterResponse>
        {
            Success = true,
            Code = 201,
            Data = registerResponse
        });
 
    }
 
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
        //done
        var user = await _userService.GetUserByEmail(request.Email);
        if (user is null || !_hasher.Verify(request.Password, user.Password, user.PasswordSalt))
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid username or password"
            });
        }
 
        var (accessToken, accessExpires) = _tokenService.GenerateAccessToken(user);
        var (refreshToken, refreshExpires, refreshHash) = _tokenService.GenerateRefreshToken(_jwtSettings.Value.RefreshTokenDays);
 
        _tokenService.SetTokenCookie(refreshToken, Response, _jwtSettings.Value.RefreshTokenDays);
 
        var refreshEntity = new UserRefreshToken
        {
            UserId = user.UserId,
            TokenHash = refreshHash,
            ExpiresAt = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        //done
        await _authService.AddUserRefreshToken(refreshEntity);
 
 
        var authResponse = new AuthResponse(accessToken, accessExpires);
        return Created(string.Empty, new ApiResponse<AuthResponse>
        {
            Success = true,
            Code = 201,
            Data = authResponse
        });
    }
 
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
 
        var refreshToken = Request.Cookies["refreshToken"];
 
        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Refresh token not found in cookies."
            });
        }
        var tokenHash = _tokenService.HashToken(refreshToken);
 
        //done
        var stored = await _authService.GetUserByHashToken(tokenHash);
 
        if (stored is null || !stored.IsActive || stored.User is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token."
            });
        }
 
        stored.RevokedAt = DateTime.UtcNow;
 
        var (newAccessToken, newAccessExpires) = _tokenService.GenerateAccessToken(stored.User);
        var (newRefreshToken, newRefreshExpires, newRefreshHash) = _tokenService.GenerateRefreshToken(_jwtSettings.Value.RefreshTokenDays);
 
        stored.ReplacedByTokenHash = newRefreshHash;
        _tokenService.SetTokenCookie(newRefreshToken, Response, _jwtSettings.Value.RefreshTokenDays);
        //done
 
        await _authService.AddUserRefreshToken(new UserRefreshToken
        {
            UserId = stored.UserId,
            TokenHash = newRefreshHash,
            ExpiresAt = newRefreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });
 
 
 
        var authResponse = new AuthResponse(newAccessToken, newAccessExpires);
        return Created(string.Empty, new ApiResponse<AuthResponse>
        {
            Success = true,
            Code = 201,
            Data = authResponse
        });
    }
 
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
        var refreshToken = Request.Cookies["refreshToken"];
 
        if (string.IsNullOrEmpty(refreshToken))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Refresh token not found in cookies."
            });
        }
 
        var tokenHash = _tokenService.HashToken(refreshToken);
        //done
        var stored = await _authService.GetUserByHashToken(tokenHash);
        if (stored is null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Code = 404,
                Error = "Refresh token not found or already revoked."
            });
        }
        //done
        await _authService.UpdateRevokedAtAsync(stored);
        Response.Cookies.Delete("refreshToken");
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = new { revokedAt = stored.RevokedAt }
        });
 
    }
}