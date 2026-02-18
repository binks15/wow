using backend.Data;
using backend.DTO.Common;
using backend.Entities.Games;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Games;

public class GameSlotRepository : IGameSlotRepository
{
    private readonly AppDbContext _db;

    public GameSlotRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Game?> GetGameByIdAsync(long gameId)
    {
        return await _db.Games.FirstOrDefaultAsync(g => g.GameId == gameId);
    }

    public async Task<IReadOnlyCollection<DateTime>> GetSlotStartTimesAsync(long gameId, DateTime start, DateTime endExclusive)
    {
        return await _db.GameSlots
            .Where(s => s.GameId == gameId && s.StartTime >= start && s.StartTime < endExclusive)
            .Select(s => s.StartTime)
            .ToListAsync();
    }

    public async Task AddSlotsAsync(IEnumerable<GameSlot> slots)
    {
        _db.GameSlots.AddRange(slots);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyCollection<GameSlot>> GetSlotsInRangeAsync(long gameId, DateTime start, DateTime endExclusive)
    {
        return await _db.GameSlots
            .Where(s => s.GameId == gameId && s.StartTime >= start && s.StartTime < endExclusive)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }



    public async Task<IReadOnlyCollection<GameSlot>> GetSlotsForDateAsync(long gameId, DateTime date)
    {
        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);

        return await _db.GameSlots
            .Where(s => s.GameId == gameId && s.StartTime >= dayStart && s.StartTime < dayEnd)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<GameBooking>> GetBookingsWithParticipantsBySlotIdsAsync(IReadOnlyCollection<long> slotIds)
    {
        return await _db.GameBookings
            .Where(b => slotIds.Contains(b.SlotId) && b.Status != BookingStatus.Cancelled)
            .Include(b => b.Participants)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<EmployeeLookupDto>> GetEmployeeLookupByIdsAsync(IReadOnlyCollection<long> userIds)
    {
        return await _db.Users
            .Where(u => userIds.Contains(u.UserId))
            .Select(u => new EmployeeLookupDto(u.UserId, u.FullName, u.Email))
            .ToListAsync();
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
}