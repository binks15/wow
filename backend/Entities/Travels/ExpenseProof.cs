using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities.Travels
{
    [Table("expense_proofs")]
    public class ExpenseProof
    {
        [Key]
        [Column("pk_proof_id")]
        public long ProofId { get; set; }

        [Required]
        [Column("fk_expense_id")]
        public long ExpenseId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("file_name")]
        public string? FileName { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("file_path")]
        public string? FilePath { get; set; }

        [MaxLength(50)]
        [Column("file_type")]
        public ExpenseFileType? FileType { get; set; }

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ExpenseId")]
        public virtual Expense? Expense { get; set; }
    }

    public enum ExpenseFileType
    {
        Pdf,
        Image

    }
}
