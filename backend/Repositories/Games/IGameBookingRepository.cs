using backend.DTO.Common;
using backend.Entities.Games;

namespace backend.Repositories.Games;

public interface IGameBookingRepository
{
    Task<GameBooking?> GetBookingWithDetailsAsync(long bookingId);
    Task<IReadOnlyCollection<GameBooking>> GetBookingsForUserAsync(long userId, DateTime fromUtc, DateTime toUtc);
    Task<GameBooking?> GetActiveBookingBySlotIdAsync(long slotId);
    Task<IReadOnlyCollection<EmployeeLookupDto>> GetEmployeeLookupByIdsAsync(IReadOnlyCollection<long> userIds);
    Task SaveAsync();
}