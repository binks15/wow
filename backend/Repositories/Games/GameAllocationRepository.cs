using backend.Data;
using backend.DTO.Common;
using backend.Entities.Games;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Games;

public class GameAllocationRepository : IGameAllocationRepository
{
    private readonly AppDbContext _db;

    public GameAllocationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Game?> GetGameByIdAsync(long gameId)
    {
        return await _db.Games.FirstOrDefaultAsync(g => g.GameId == gameId);
    }

    public async Task<IReadOnlyCollection<GameSlot>> GetSlotsForAllocationWindowAsync(DateTime start, DateTime end)
    {
        return await _db.GameSlots
            .Include(s => s.Game)
            .Where(s => s.Status == GameSlotStatus.Open && s.StartTime >= start && s.StartTime <= end)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<GameSlotRequest>> GetSlotRequestsByStatusAsync(long slotId, GameSlotRequestStatus status)
    {
        return await _db.GameSlotRequests
            .Include(r => r.Participants)
            .Where(r => r.SlotId == slotId && r.Status == status)
            .OrderBy(r => r.RequestedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<long>> GetInterestedUserIdsAsync(long gameId)
    {
        return await _db.UserGameInterests
            .Where(i => i.GameId == gameId && i.IsInterested)
            .Select(i => i.UserId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<(DateTime? Start, DateTime? End)> GetLatestCycleAsync(long gameId)
    {
        var latest = await _db.GameHistories
            .Where(h => h.GameId == gameId)
            .OrderByDescending(h => h.CycleStartDate)
            .Select(h => new { h.CycleStartDate, h.CycleEndDate })
            .FirstOrDefaultAsync();

        return latest is null
            ? (null, null)
            : (latest.CycleStartDate, latest.CycleEndDate);
    }

    public async Task<IReadOnlyCollection<GameHistory>> GetGameHistoriesAsync(long gameId, DateTime cycleStart, IReadOnlyCollection<long> userIds)
    {
        return await _db.GameHistories
            .Where(h => h.GameId == gameId && h.CycleStartDate == cycleStart && userIds.Contains(h.UserId))
            .ToListAsync();
    }

    public async Task CloseCycleAsync(long gameId, DateTime cycleStart, DateTime cycleEnd)
    {
        var histories = await _db.GameHistories
            .Where(h => h.GameId == gameId && h.CycleStartDate == cycleStart)
            .ToListAsync();

        if (histories.Count == 0)
        {
            return;
        }

        foreach (var history in histories)
        {
            history.CycleEndDate = cycleEnd;
        }
    }

    public async Task<IReadOnlyCollection<long>> GetBookedUserIdsForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate)
    {
        var bookingIds = await _db.GameBookingParticipants
            .Where(p => userIds.Contains(p.UserId))
            .Join(_db.GameBookings, p => p.BookingId, b => b.BookingId, (_, b) => b)
            .Where(b => b.BookingDate.Date == bookingDate && b.Status != BookingStatus.Cancelled)
            .Select(b => b.BookingId)
            .Distinct()
            .ToListAsync();

        if (bookingIds.Count == 0)
        {
            return Array.Empty<long>();
        }

        return await _db.GameBookingParticipants
            .Where(p => bookingIds.Contains(p.BookingId))
            .Select(p => p.UserId)
            .Distinct()
            .ToListAsync();
    }

    public Task AddGameBookingAsync(GameBooking booking)
    {
        _db.GameBookings.Add(booking);
        return Task.CompletedTask;
    }

    public Task AddGameHistoriesAsync(IEnumerable<GameHistory> histories)
    {
        _db.GameHistories.AddRange(histories);
        return Task.CompletedTask;
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