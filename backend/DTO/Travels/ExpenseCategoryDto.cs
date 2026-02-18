using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Travels;

public record ExpenseCategoryCreateDto(
    [Required, MaxLength(200)] string? CategoryName,
    [Required] decimal? MaxAmountPerDay
);

public record ExpenseCategoryResponseDto(
    long CategoryId,
    string? CategoryName,
    decimal? MaxAmountPerDay
);
