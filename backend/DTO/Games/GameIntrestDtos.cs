using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Games;

public record GameInterestDto(
    long GameId,
    string GameName,
    bool IsInterested
);

public record GameInterestUpdateDto(
    [Required] List<long> GameIds
);