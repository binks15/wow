using backend.Entities.Common;

namespace backend.Repositories.Common;

public interface INotificationRepository
{
    Task AddNotificationsAsync(IEnumerable<Notification> notifications);
    Task<IReadOnlyCollection<Notification>> GetByUserAsync(long userId);
    Task<Notification?> GetByIdAsync(long notificationId, long userId);
    Task SaveAsync();
}