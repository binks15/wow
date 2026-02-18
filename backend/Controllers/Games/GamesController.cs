using backend.DTO.Common;
using backend.DTO.Games;
using backend.Services.Common;
using backend.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Games;

[ApiController]
[Route("api/v1/games")]
public class GamesController : ControllerBase
{
    private readonly GameService _service;
    private readonly AuthService _auth;

    public GamesController(GameService service, AuthService auth)
    {
        _service = service;
        _auth = auth;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetGames()
    {
        var result = await _service.GetAllAsync();
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize]
    [HttpGet("{gameId:long}")]
    public async Task<IActionResult> GetGameById(long gameId)
    {
        try
        {
            var result = await _service.GetByIdAsync(gameId);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200,
                Data = result
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

    [Authorize(Roles = "HR,Manager")]
    [HttpPost]
    public async Task<IActionResult> CreateGame([FromBody] GameCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var result = await _service.CreateAsync(dto);
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

    [Authorize(Roles = "HR,Manager")]
    [HttpPut("{gameId:long}")]
    public async Task<IActionResult> UpdateGame(long gameId, [FromBody] GameUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var result = await _service.UpdateAsync(gameId, dto);
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
    [HttpGet("interests/me")]
    public async Task<IActionResult> GetMyInterests()
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

        var result = await _service.GetUserInterestsAsync(userId.Value);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize]
    [HttpPut("interests/me")]
    public async Task<IActionResult> UpdateMyInterests([FromBody] GameInterestUpdateDto dto)
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
            var result = await _service.UpdateUserInterestsAsync(userId.Value, dto.GameIds);
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
}