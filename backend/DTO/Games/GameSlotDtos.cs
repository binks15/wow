using System.ComponentModel.DataAnnotations;
using backend.Entities.Games;
using backend.DTO.Common;

namespace backend.DTO.Games;

public record GameSlotDto(
    long SlotId,
    long GameId,
    DateTime StartTime,
    DateTime EndTime,
    GameSlotStatus Status
);

public record GameSlotSummaryDto(
    long SlotId,
    long GameId,
    DateTime StartTime,
    DateTime EndTime,
    GameSlotStatus Status,
    IReadOnlyCollection<EmployeeLookupDto> Participants
);

public record GameSlotRequestCreateDto(
    List<long>? ParticipantIds
);

public record GameSlotRequestDto(
    long RequestId,
    long SlotId,
    long RequestedBy,
    GameSlotRequestStatus Status,
    DateTime RequestedAt,
    IReadOnlyCollection<long> ParticipantIds
);

public record GameSlotRequestSummaryDto(
    long RequestId,
    long GameId,
    string GameName,
    long SlotId,
    DateTime StartTime,
    DateTime EndTime,
    GameSlotRequestStatus Status,
    DateTime RequestedAt,
    long RequestedBy,
    IReadOnlyCollection<EmployeeLookupDto> Participants
);

public record AllocationResult(
    IReadOnlyCollection<long> AssignedUserIds,
    IReadOnlyCollection<GameSlotRequest> AssignedRequests,
    IReadOnlyCollection<GameSlotRequest> WaitlistedRequests,
    long RequestedBy,
    DateTime CycleStart
);