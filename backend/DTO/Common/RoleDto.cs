using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Common;

public record RoleCreateDto(
    [Required, MaxLength(100)] string Name,
    [MaxLength(500)] string? Description
);

public record RoleResponseDto(
    long RoleId,
    string Name,
    string? Description
);