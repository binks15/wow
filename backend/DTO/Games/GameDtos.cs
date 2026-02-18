using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Games;

public record GameDto(
    long GameId,
    string GameName,
    TimeSpan OperatingHoursStart,
    TimeSpan OperatingHoursEnd,
    int SlotDurationMinutes,
    int MaxPlayersPerSlot
);

public record GameCreateDto(
    [Required, MaxLength(100)] string GameName,
    [Required] TimeSpan OperatingHoursStart,
    [Required] TimeSpan OperatingHoursEnd,
    [Range(1, 1440)] int SlotDurationMinutes,
    [Range(1, 50)] int MaxPlayersPerSlot
);

public record GameUpdateDto(
    [MaxLength(100)] string? GameName,
     TimeSpan? OperatingHoursStart,
     TimeSpan? OperatingHoursEnd,
    [Range(1, 1440)] int? SlotDurationMinutes,
    [Range(1, 50)] int? MaxPlayersPerSlot
);