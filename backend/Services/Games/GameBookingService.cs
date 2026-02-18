using backend.DTO.Common;
using backend.DTO.Games;
using backend.Entities.Games;
using backend.Repositories.Games;

namespace backend.Services.Games;

/// <summary>
/// Handles booking cancellation and returns booking details for users.
/// </summary>
public class GameBookingService
{
    private readonly IGameBookingRepository _repository;
    private readonly GameAllocationService _allocationService;

    /// <summary>
    /// Initializes booking service dependencies for booking retrieval, cancellation, and waitlist refill.
    /// </summary>
    public GameBookingService(IGameBookingRepository repository, GameAllocationService allocationService)
    {
        _repository = repository;
        _allocationService = allocationService;
    }

    /// <summary>
    /// Cancels a booking by booking id after confirming the requester is part of that booking.
    /// </summary>
    public async Task CancelBookingAsync(long bookingId, long requesterId)
    {
        var booking = await _repository.GetBookingWithDetailsAsync(bookingId);

        if (booking is null)
        {
            throw new ArgumentException("Booking not found.");
        }

        var isParticipant = booking.Participants.Any(p => p.UserId == requesterId) || booking.CreatedBy == requesterId;
        if (!isParticipant)
        {
            throw new ArgumentException("You can only cancel your own booking.");
        }

        await CancelBookingCoreAsync(booking);
    }

    /// <summary>
    /// Cancels the active booking linked to a slot when the requester belongs to that booking.
    /// </summary>
    public async Task CancelBookingBySlotAsync(long slotId, long requesterId)
    {
        var booking = await _repository.GetActiveBookingBySlotIdAsync(slotId);
        if (booking is null)
        {
            return;
        }

        var isParticipant = booking.Participants.Any(p => p.UserId == requesterId) || booking.CreatedBy == requesterId;
        if (!isParticipant)
        {
            throw new ArgumentException("You can only cancel your own booking.");
        }

        await CancelBookingCoreAsync(booking);
    }

    /// <summary>
    /// Returns the current user's bookings in a date range including participant employee details.
    /// </summary>
    public async Task<IReadOnlyCollection<GameBookingDto>> GetMyBookingsAsync(long userId, DateTime fromUtc, DateTime toUtc)
    {
        var bookings = await _repository.GetBookingsForUserAsync(userId, fromUtc, toUtc);
        if (bookings.Count == 0)
        {
            return Array.Empty<GameBookingDto>();
        }

        var userIds = bookings
            .SelectMany(b => b.Participants.Select(p => p.UserId))
            .Distinct()
            .ToList();

        var users = await _repository.GetEmployeeLookupByIdsAsync(userIds);
        var userLookup = users.ToDictionary(u => u.Id, u => u);

        return bookings.Select(booking =>
        {
            var startTime = booking.Slot?.StartTime ?? booking.BookingDate.Date.Add(booking.SlotStartTime);
            var endTime = booking.Slot?.EndTime ?? booking.BookingDate.Date.Add(booking.SlotEndTime);
            var participants = booking.Participants
                .Select(p => userLookup.TryGetValue(p.UserId, out var user) ? user : new EmployeeLookupDto(p.UserId, string.Empty, string.Empty))
                .ToList();

            return new GameBookingDto(
                booking.BookingId,
                booking.GameId,
                booking.Game?.GameName ?? string.Empty,
                booking.SlotId,
                startTime,
                endTime,
                booking.Status,
                participants
            );
        }).ToList();
    }

    /// <summary>
    /// Applies cancellation updates and tries to refill the slot from waitlisted requests.
    /// </summary>
    private async Task CancelBookingCoreAsync(GameBooking booking)
    {
        if (booking.Status == BookingStatus.Cancelled)
        {
            return;
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        await _repository.SaveAsync();

        if (booking.Slot is not null)
        {
            await _allocationService.FillSlotFromWaitlistAsync(booking.Slot);
            await _repository.SaveAsync();
        }
    }
}