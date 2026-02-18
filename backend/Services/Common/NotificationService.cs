using backend.DTO.Common;
using backend.Repositories.Common;
using backend.Entities.Common;

namespace backend.Services.Common;

public class NotificationService
{
    private readonly INotificationRepository _repo;

    public NotificationService(INotificationRepository repo)
    {
        _repo = repo;
    }

    public async Task CreateForUsersAsync(IEnumerable<long> userIds, string title, string message)
    {
        var notifications = userIds.Select(id => new Notification
        {
            UserId = id,
            Title = title,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        if (notifications.Count == 0)
        {
            return;
        }

        await _repo.AddNotificationsAsync(notifications);
    }

    public async Task<IReadOnlyCollection<NotificationDto>> GetByUserAsync(long userId)
    {
        var list = await _repo.GetByUserAsync(userId);
        return list.Select(n => new NotificationDto(n.NotificationId, n.Title, n.Message, n.IsRead, n.CreatedAt)).ToList();
    }

    public async Task MarkReadAsync(long notificationId, long userId, bool isRead)
    {
        var notification = await _repo.GetByIdAsync(notificationId, userId);
        if (notification is null)
        {
            throw new ArgumentException("Notification not found.");
        }

        notification.IsRead = isRead;
        await _repo.SaveAsync();
    }
}