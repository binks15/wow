using backend.DTO.Common;
using backend.Entities.Games;

namespace backend.DTO.Games;

public record GameBookingDto(
    long BookingId,
    long GameId,
    string GameName,
    long SlotId,
    DateTime StartTime,
    DateTime EndTime,
    BookingStatus Status,
    IReadOnlyCollection<EmployeeLookupDto> Participants
);