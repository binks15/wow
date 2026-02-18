using backend.DTO.Common;
using backend.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
 
namespace backend.Controllers.Common;
 
[ApiController]
[Route("api/v1/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _service;
 
    private readonly AuthService _auth;
 
    public NotificationController(NotificationService service, AuthService auth)
    {
        _service = service;
        _auth = auth;
    }
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var userId = _auth.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }
 
        var result = await _service.GetByUserAsync(userId.Value);
        return Ok(new ApiResponse<Object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
 
    [Authorize]
    [HttpPatch("{notificationId:int}")]
    public async Task<IActionResult> MarkRead(long notificationId, [FromBody] MarkReadDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
 
        var userId = _auth.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }
 
        try
        {
            await _service.MarkReadAsync(notificationId, userId.Value, dto.IsRead);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200
            });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Code = 404,
                Error = ex.Message
            });
        }
    }
}
 