using backend.DTO.Common;
using backend.DTO.Travels;
using backend.Services.Common;
using backend.Services.Travels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
 
namespace backend.Controllers.Travels;
 
[ApiController]
[Route("api/v1/travel-documents")]
public class TravelDocumentController : ControllerBase
{
    private readonly TravelDocumentService _service;
 
    private readonly AuthService _auth;
 
    public TravelDocumentController(TravelDocumentService service, AuthService auth)
    {
        _service = service;
        _auth = auth;
    }
 
    [Authorize(Roles = "HR,Employee")]
    [HttpPost]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Upload([FromForm] TravelDocumentUploadDto dto)
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
 
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
        try
        {
            var result = await _service.UploadAsync(dto, userId.Value, role);
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
 
    [Authorize(Roles = "HR,Employee,Manager")]
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] long? travelId, [FromQuery] long? employeeId)
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
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
 
 
        try
        {
            var result = await _service.ListAsync(userId.Value, role, travelId, employeeId);
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
 
    [Authorize(Roles = "HR,Employee")]
    [HttpPut("{documentId:int}")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Update(long documentId, [FromForm] TravelDocumentUpdateDto dto)
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
            var result = await _service.UpdateAsync(documentId, dto, userId.Value);
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
 
    [Authorize(Roles = "HR,Employee")]
    [HttpDelete("{documentId:int}")]
    public async Task<IActionResult> Delete(long documentId)
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
 
        try
        {
            await _service.DeleteAsync(documentId, userId.Value);
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
 