using backend.Data;
using backend.DTO.Common;
using backend.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers.Common;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{

    private readonly UserService _service;
    private readonly AuthService _auth;

    public UsersController(UserService userService, AuthService authService)
    {
        _service = userService;
        _auth = authService;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var currentUserId = _auth.GetUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }

        var result = await _service.GetUserProfileAsync(currentUserId.Value);
        if (result is null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Code = 404,
                Error = "User not found."
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDto dto)
    {
        var currentUserId = _auth.GetUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }

        var result = await _service.UpdateUserProfileAsync(currentUserId.Value, dto);
        if (result is null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Code = 404,
                Error = "User not found."
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }


    [Authorize]
    [HttpGet("org-chart/{userId:int}")]
    public async Task<IActionResult> GetOrgChartByUser(long userId)
    {
        try
        {
            var result = await _service.GetOrgChartAsync(userId);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200,
                Data = result
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = ex.Message
            });
        }
    }

    [Authorize]
    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar( IFormFile file)
    {
        if (file is null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Avatar file is required."
            });
        }

        var currentUserId = _auth.GetUserId(User);
        if (currentUserId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }

        var result = await _service.UpdateProfilePhotoAsync(currentUserId.Value, file);
        if (result is null)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Code = 404,
                Error = "User not found."
            });
        }

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "HR")]
    [HttpGet]
    public async Task<IActionResult> ListEmployees()
    {
        var results = await _service.GetListOfEmployee();
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = results
        });

    }

    [Authorize(Roles = "HR")]
    [HttpGet("search")]
    public async Task<IActionResult> SearchEmployees([FromQuery] string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "Query is required."
            });
        }

        var trimmed = query.Trim();
        var results = await _service.SearchEmployee(trimmed);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = results
        });
    }
}