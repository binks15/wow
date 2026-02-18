using backend.Services.Travels;
using backend.DTO.Travels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Services.Common;
using backend.DTO.Common;

namespace backend.Controllers.Travels;

[ApiController]
[Route("api/v1/expenses")]
public class ExpenseController : ControllerBase
{
    private readonly ExpenseService _service;

    private readonly AuthService _auth;

    public ExpenseController(ExpenseService service, AuthService auth)
    {
        _service = service;
        _auth = auth;
    }

    [Authorize(Roles = "Employee")]
    [HttpPost]
    public async Task<IActionResult> CreateDraft([FromBody] ExpenseCreateDto dto)
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
            var result = await _service.CreateDraftAsync(dto, userId.Value);
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

    [Authorize(Roles = "Employee")]
    [HttpPost("{expenseId:int}/proofs")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> UploadProof(long expenseId, [FromForm] ExpenseProofUploadDto dto)
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
            await _service.UploadProofAsync(expenseId, dto, userId.Value);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200,
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

    [Authorize(Roles = "Employee")]
    [HttpPost("{expenseId:int}/submit")]
    public async Task<IActionResult> Submit(long expenseId)
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
            var result = await _service.SubmitAsync(expenseId, userId.Value);
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
    [HttpPost("{expenseId:int}/review")]
    public async Task<IActionResult> Review(long expenseId, [FromBody] ExpenseReviewDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var reviewerId = _auth.GetUserId(User);
        if (reviewerId is null)
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
            var result = await _service.ReviewAsync(expenseId, dto, reviewerId.Value);
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

    [Authorize(Roles = "Employee")]
    [HttpPut("{expenseId:int}")]
    public async Task<IActionResult> UpdateDraft(long expenseId, [FromBody] ExpenseUpdateDto dto)
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
            var result = await _service.UpdateDraftAsync(expenseId, dto, userId.Value);
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

    [Authorize(Roles = "Employee")]
    [HttpDelete("{expenseId:int}")]
    public async Task<IActionResult> DeleteDraft(long expenseId)
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
            await _service.DeleteDraftAsync(expenseId, userId.Value);
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

    [Authorize(Roles = "Employee")]
    [HttpDelete("{expenseId:int}/proofs/{proofId:int}")]
    public async Task<IActionResult> DeleteProof(long expenseId, long proofId)
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
            await _service.DeleteProofAsync(expenseId, proofId, userId.Value);
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

    [Authorize(Roles = "Employee")]
    [HttpGet("my")]
    public async Task<IActionResult> MyExpenses()
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

        var result = await _service.ListForEmployeeAsync(userId.Value);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "HR")]
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] long? employeeId, [FromQuery] long? travelId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? status)
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

        var result = await _service.ListForHrAsync(employeeId, travelId, from, to, status, currentUserId.Value);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
}