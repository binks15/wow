using backend.Data;
using backend.Entities.Common;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Common;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _db;

    public NotificationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddNotificationsAsync(IEnumerable<Notification> notifications)
    {
        _db.Set<Notification>().AddRange(notifications);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyCollection<Notification>> GetByUserAsync(long userId)
    {
        return await _db.Set<Notification>()
            .Where(n => n.UserId == userId && n.IsRead == false)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(long notificationId, long userId)
    {
        return await _db.Set<Notification>()
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
}