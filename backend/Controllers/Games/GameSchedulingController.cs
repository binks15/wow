using backend.DTO.Common;
using backend.DTO.Games;
using backend.Services.Common;
using backend.Services.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Games;

[ApiController]
[Route("api/v1/games")]
public class GameSchedulingController : ControllerBase
{
    private readonly GameSlotService _slotService;
    private readonly GameRequestService _requestService;
    private readonly GameBookingService _bookingService;
    private readonly AuthService _auth;

    public GameSchedulingController(GameSlotService slotService, GameRequestService requestService, GameBookingService bookingService, AuthService auth)
    {
        _slotService = slotService;
        _requestService = requestService;
        _bookingService = bookingService;
        _auth = auth;
    }

    [Authorize(Roles = "HR,Manager")]
    [HttpPost("{gameId:long}/slots/generate")]
    public async Task<IActionResult> GenerateSlots(long gameId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        try
        {
            var result = await _slotService.GenerateSlotsAsync(gameId, startDate, endDate);
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


    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpGet("{gameId:long}/slots/today")]
    public async Task<IActionResult> GetTodaySlots(long gameId)
    {
        var result = await _slotService.GetSlotsForDateAsync(gameId, DateTime.Now);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpPost("{gameId:long}/slots/{slotId:long}/requests")]
    public async Task<IActionResult> RequestSlot(long gameId, long slotId, [FromBody] GameSlotRequestCreateDto dto)
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
            var result = await _requestService.RequestSlotAsync(gameId, slotId, userId.Value, dto.ParticipantIds ?? new List<long>());
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

    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpDelete("requests/{requestId:long}")]
    public async Task<IActionResult> CancelRequest(long requestId)
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
            await _requestService.CancelRequestAsync(requestId, userId.Value);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200,
                Data = "Request cancelled."
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
    [HttpDelete("bookings/{bookingId:long}")]
    public async Task<IActionResult> CancelBooking(long bookingId)
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
            await _bookingService.CancelBookingAsync(bookingId, userId.Value);
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Code = 200,
                Data = "Booking cancelled."
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
    [HttpGet("{gameId:long}/slots/upcoming")]
    public async Task<IActionResult> GetUpcomingSlots(long gameId, [FromQuery] int days = 7)
    {
        var fromLocal = DateTime.Now;
        var toLocal = fromLocal.AddDays(Math.Max(1, days));
        var result = await _slotService.GetUpcomingSlotsAsync(gameId, fromLocal, toLocal);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpGet("bookings/me")]
    public async Task<IActionResult> GetMyBookings([FromQuery] int days = 7)
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

        var fromLocal = DateTime.Now;
        var toLocal = fromLocal.AddDays(Math.Max(1, days));
        var result = await _bookingService.GetMyBookingsAsync(userId.Value, fromLocal, toLocal);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }

    [Authorize(Roles = "Employee,Manager,HR")]
    [HttpGet("requests/me")]
    public async Task<IActionResult> GetMyRequests([FromQuery] int days = 7)
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

        var fromLocal = DateTime.Now;
        var toLocal = fromLocal.AddDays(Math.Max(1, days));
        var result = await _requestService.GetMyRequestsAsync(userId.Value, fromLocal, toLocal);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Code = 200,
            Data = result
        });
    }
}