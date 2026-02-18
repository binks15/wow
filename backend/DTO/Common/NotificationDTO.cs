using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Common;

public record NotificationDto(
    long NotificationId,
    string Title,
    string Message,
    bool IsRead,
    DateTime CreatedAt
);

public record MarkReadDto(
    [Required] bool IsRead
);