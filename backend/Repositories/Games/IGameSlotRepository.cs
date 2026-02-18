using backend.DTO.Common;
using backend.Entities.Games;

namespace backend.Repositories.Games;

public interface IGameSlotRepository
{
    Task<Game?> GetGameByIdAsync(long gameId);
    Task<IReadOnlyCollection<DateTime>> GetSlotStartTimesAsync(long gameId, DateTime start, DateTime endExclusive);
    Task AddSlotsAsync(IEnumerable<GameSlot> slots);
    Task<IReadOnlyCollection<GameSlot>> GetSlotsInRangeAsync(long gameId, DateTime start, DateTime endExclusive);
    Task<IReadOnlyCollection<GameSlot>> GetSlotsForDateAsync(long gameId, DateTime date);
    Task<IReadOnlyCollection<GameBooking>> GetBookingsWithParticipantsBySlotIdsAsync(IReadOnlyCollection<long> slotIds);
    Task<IReadOnlyCollection<EmployeeLookupDto>> GetEmployeeLookupByIdsAsync(IReadOnlyCollection<long> userIds);
    Task SaveAsync();
}