using backend.DTO.Common;
using backend.Entities.Games;

namespace backend.Repositories.Games;

public interface IGameRequestRepository
{
    Task<GameSlot?> GetSlotWithGameAsync(long gameId, long slotId);
    Task<int> CountInterestedUsersAsync(long gameId, IReadOnlyCollection<long> userIds);
    Task<bool> HasBookingForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate);
    Task<bool> HasActiveRequestForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate);
    Task AddSlotRequestAsync(GameSlotRequest request);
    Task<GameSlotRequest?> GetSlotRequestByIdAsync(long requestId);
    Task<IReadOnlyCollection<GameSlotRequest>> GetActiveRequestsForUserAsync(long userId, DateTime from, DateTime to);
    Task<IReadOnlyCollection<EmployeeLookupDto>> GetEmployeeLookupByIdsAsync(IReadOnlyCollection<long> userIds);
    Task SaveAsync();
}