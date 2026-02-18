using backend.Entities.Travels;
using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Travels;

public class TravelDocumentUploadDto
{

    [Required]
    public long TravelId { get; set; }

    // [Required]
    public long? EmployeeId { get; set; }

    [Required, MaxLength(200)]
    public string DocumentType { get; set; } = string.Empty;

    [Required]
    public IFormFile File { get; set; } = null!;
}

public class TravelDocumentUpdateDto
{
    [MaxLength(200)]
    public string? DocumentType { get; set; }

    public IFormFile? File { get; set; }
}

public record TravelDocumentDto(
    long DocumentId,
    long TravelId,
    long? EmployeeId,
    long UploadedById,
    string? UploadedByName,
    string OwnerType,
    string? DocumentType,
    string? FileName,
    string? FilePath,
    DateTime UploadedAt
);