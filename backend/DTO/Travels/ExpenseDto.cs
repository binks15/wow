using backend.Entities.Travels;
using System.ComponentModel.DataAnnotations;
 
namespace backend.DTO.Travels
{
 
    public record ExpenseCreateDto(
        [Required] long AssignId,
        [Required] long CategoryId,
        [Required] decimal Amount,
        [Required, MaxLength(10)] string Currency,
        [Required] DateTime ExpenseDate
    );
 
    public record ExpenseProofDto(
        long ProofId,
        string FileName,
        string FilePath,
        string? FileType,
        DateTime UploadedAt
    );
 
    public record ExpenseResponseDto(
        long ExpenseId,
        // long AssignId,
        long EmployeeId,
        long CategoryId,
        decimal Amount,
        string Currency,
        DateTime ExpenseDate,
        ExpenseStatus Status,
        DateTime? SubmittedAt,
        long? ReviewedById,
        DateTime? ReviewedAt,
        string? Remarks,
        IReadOnlyCollection<ExpenseProofDto> Proofs
    );
 
    public record ExpenseReviewDto(
        [Required] ExpenseStatus Status,
        [MaxLength(2000)] string? Remarks
    );
 
    public record ExpenseUpdateDto(
        [Required] long CategoryId,
        [Required] decimal Amount,
        [Required, MaxLength(10)] string Currency,
        [Required] DateTime ExpenseDate
    );
 
    public class ExpenseProofUploadDto
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
 