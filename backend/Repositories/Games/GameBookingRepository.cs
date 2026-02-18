using backend.Data;
using backend.DTO.Common;
using backend.Entities.Games;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Games;

public class GameBookingRepository : IGameBookingRepository
{
    private readonly AppDbContext _db;

    public GameBookingRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<GameBooking?> GetBookingWithDetailsAsync(long bookingId)
    {
        return await _db.GameBookings
            .Include(b => b.Participants)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.BookingId == bookingId);
    }

    public async Task<IReadOnlyCollection<GameBooking>> GetBookingsForUserAsync(long userId, DateTime fromUtc, DateTime toUtc)
    {
        return await _db.GameBookings
            .Include(b => b.Participants)
            .Include(b => b.Game)
            .Include(b => b.Slot)
            .Where(b => b.Status != BookingStatus.Cancelled)
            .Where(b => b.Participants.Any(p => p.UserId == userId) || b.CreatedBy == userId)
            .Where(b => b.Slot != null && b.Slot.StartTime >= fromUtc && b.Slot.StartTime <= toUtc)
            .OrderBy(b => b.Slot!.StartTime)
            .ToListAsync();
    }

    public async Task<GameBooking?> GetActiveBookingBySlotIdAsync(long slotId)
    {
        return await _db.GameBookings
            .Include(b => b.Participants)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.SlotId == slotId && b.Status != BookingStatus.Cancelled);
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