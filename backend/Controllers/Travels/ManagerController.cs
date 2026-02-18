using backend.Services.Travels;
using backend.DTO.Common;
using backend.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
 
namespace backend.Controllers.Travels;
 
[ApiController]
[Route("api/v1/manager")]
public class ManagerController : ControllerBase
{
    private readonly ManagerService _service;
    private readonly AuthService _auth;
 
    public ManagerController(ManagerService service, AuthService auth)
    {
        _service = service;
        _auth = auth;
    }
 
    [Authorize(Roles = "Manager")]
    [HttpGet("team-members")]
    public async Task<IActionResult> TeamMembers()
    {
        var managerId = _auth.GetUserId(User);
        if (managerId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }
 
        var result = await _service.GetTeamMembersAsync(managerId.Value);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
 
    [Authorize(Roles = "Manager")]
    [HttpGet("team-expenses")]
    public async Task<IActionResult> TeamExpenses([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var managerId = _auth.GetUserId(User);
        if (managerId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }
 
        var result = await _service.GetTeamExpensesAsync(managerId.Value, from, to);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
}
 