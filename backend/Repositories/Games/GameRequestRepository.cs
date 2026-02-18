using backend.Data;
using backend.DTO.Common;
using backend.Entities.Games;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Games;

public class GameRequestRepository : IGameRequestRepository
{
    private readonly AppDbContext _db;

    public GameRequestRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GameSlot?> GetSlotWithGameAsync(long gameId, long slotId)
    {
        return await _db.GameSlots
            .Include(s => s.Game)
            .FirstOrDefaultAsync(s => s.SlotId == slotId && s.GameId == gameId);
    }

    public async Task<int> CountInterestedUsersAsync(long gameId, IReadOnlyCollection<long> userIds)
    {
        return await _db.UserGameInterests
            .Where(i => i.GameId == gameId && i.IsInterested && userIds.Contains(i.UserId))
            .Select(i => i.UserId)
            .Distinct()
            .CountAsync();
    }

    public async Task<bool> HasBookingForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate)
    {
        return await _db.GameBookingParticipants
            .Where(p => userIds.Contains(p.UserId))
            .Join(_db.GameBookings, p => p.BookingId, b => b.BookingId, (_, b) => b)
            .AnyAsync(b => b.BookingDate.Date == bookingDate && b.Status != BookingStatus.Cancelled);
    }

    public async Task<bool> HasActiveRequestForDateAsync(IReadOnlyCollection<long> userIds, DateTime bookingDate)
    {
        return await _db.GameSlotRequests
            .Include(r => r.Slot)
            .Include(r => r.Participants)
            .Where(r => r.Slot != null && r.Slot.StartTime.Date == bookingDate)
            .Where(r => r.Status == GameSlotRequestStatus.Pending || r.Status == GameSlotRequestStatus.Waitlisted || r.Status == GameSlotRequestStatus.Assigned)
            .AnyAsync(r => userIds.Contains(r.RequestedBy) || r.Participants.Any(p => userIds.Contains(p.UserId)));
    }

    public async Task AddSlotRequestAsync(GameSlotRequest request)
    {
        _db.GameSlotRequests.Add(request);
        await _db.SaveChangesAsync();
    }

    public async Task<GameSlotRequest?> GetSlotRequestByIdAsync(long requestId)
    {
        return await _db.GameSlotRequests
            .Include(r => r.Slot)
            .FirstOrDefaultAsync(r => r.RequestId == requestId);
    }

    public async Task<IReadOnlyCollection<GameSlotRequest>> GetActiveRequestsForUserAsync(long userId, DateTime from, DateTime to)
    {
        return await _db.GameSlotRequests
            .Include(r => r.Slot)
            .ThenInclude(s => s!.Game)
            .Include(r => r.Participants)
            .Where(r => r.Status == GameSlotRequestStatus.Pending || r.Status == GameSlotRequestStatus.Waitlisted || r.Status == GameSlotRequestStatus.Assigned)
            .Where(r => r.Slot != null && r.Slot.StartTime >= from && r.Slot.StartTime <= to)
            .Where(r => r.RequestedBy == userId || r.Participants.Any(p => p.UserId == userId))
            .OrderBy(r => r.Slot!.StartTime)
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