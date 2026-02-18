using backend.DTO.Common;
using backend.DTO.Travels;
using backend.Services.Common;
using backend.Services.Travels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Controllers.Travels;

[ApiController]
[Route("api/v1/travels")]
public class TravelController : ControllerBase
{
    private readonly TravelService _service;

    private readonly AuthService _auth;

    public TravelController(TravelService service, AuthService authService)
    {
        _service = service;
        _auth = authService;
    }

    [Authorize(Roles = "HR")]
    [HttpPost]
    public async Task<IActionResult> CreateTravel([FromBody] TravelCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
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
        try
        {
            var result = await _service.CreateTravelAsync(dto, currentUserId.Value);
            return CreatedAtAction(nameof(CreateTravel), new { id = result.TravelId }, new ApiResponse<object>
            {
                Success = true,
                Code = 201,
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



    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpGet("assignments")]
    public async Task<IActionResult> GetAssignments([FromQuery] long? employeeId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        var userId = _auth.GetUserId(User);

        if (role == "HR" && userId is null)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Code = 401,
                Error = "Invalid token, user not found."
            });
        }

        var resolvedEmployeeId = role == "Employee" ? userId : employeeId;
        if (resolvedEmployeeId is null)
        {
            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Code = 400,
                Error = "employeeId is required for this role."
            });
        }

        var createdById = role == "HR" ? userId : null;
        var result = await _service.GetAssignmentsForEmployeeAsync(resolvedEmployeeId.Value, createdById);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "HR")]
    [HttpGet("created")]
    public async Task<IActionResult> GetCreatedTravels()
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

        var result = await _service.GetCreatedTravelsAsync(currentUserId.Value);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "HR")]
    [HttpGet("{travelId:int}")]
    public async Task<IActionResult> GetTravelById(long travelId)
    {
        try
        {
            var result = await _service.GetTravelByIdAsync(travelId);
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

    [Authorize(Roles = "HR")]
    [HttpGet("{travelId:int}/assignees")]
    public async Task<IActionResult> GetTravelAssignees(long travelId)
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

        try
        {
            var result = await _service.GetAssigneesForTravelAsync(travelId, currentUserId.Value);
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

    [Authorize(Roles = "HR")]
    [HttpPut("{travelId:int}")]
    public async Task<IActionResult> UpdateTravel(long travelId, [FromBody] TravelUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
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

        try
        {
            var result = await _service.UpdateTravelAsync(travelId, dto, currentUserId.Value);
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

    [Authorize(Roles = "HR")]
    [HttpDelete("{travelId:int}")]
    public async Task<IActionResult> DeleteTravel(long travelId)
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

        try
        {
            await _service.DeleteTravelAsync(travelId, currentUserId.Value);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200
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

}