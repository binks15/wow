using backend.DTO.Travels;
using backend.DTO.Common;
using backend.Services.Travels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
 
namespace backend.Controllers.Travels;
 
[ApiController]
[Route("api/v1/expense-config")]
public class ExpenseCategoryController : ControllerBase
{
    private readonly ExpenseCategoryService _service;
 
    public ExpenseCategoryController(ExpenseCategoryService service)
    {
        _service = service;
    }
 
    [Authorize(Roles = "HR")]
    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] ExpenseCategoryCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }
 
        var result = await _service.CreateCategoryAsync(dto);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
 
    [Authorize]
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _service.GetCategoriesAsync();
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
}
 