using backend.DTO.Common;
using backend.Entities.Games;

namespace backend.Repositories.Games;

public interface IGameAllocationRepository
{
    Task<Game?> GetGameByIdAsync(long gameId);
    Task<IReadOnlyCollection<GameSlot>> GetSlotsForAllocationWindowAsync(DateTime start, DateTime end);
    Task<IReadOnlyCollection<GameSlotRequest>> GetSlotRequestsByStatusAsync(long slotId, GameSlotRequestStatus status);
    Task<IReadOnlyCollection<long>> GetInterestedUserIdsAsync(long gameId);
    Task<(DateTime? Start, DateTime? End)> GetLatestCycleAsync(long gameId);
    Task<IReadOnlyCollection<GameHistory>> GetGameHistoriesAsync(long gameId, DateTime cycleStart, IReadOnlyCollection<long> userIds);
    Task CloseCycleAsync(long gameId, DateTime cycleStart, DateTime cycleEnd);
    Task<IReadOnlyCollection<long>> GetBookedUserIdsForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate);
    Task AddGameBookingAsync(GameBooking booking);
    Task AddGameHistoriesAsync(IEnumerable<GameHistory> histories);
    Task<IReadOnlyCollection<EmployeeLookupDto>> GetEmployeeLookupByIdsAsync(IReadOnlyCollection<long> userIds);
    Task SaveAsync();
}