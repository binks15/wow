using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Travels
{
    [Table("expenses")]
    public class Expense
    {
        [Key]
        [Column("pk_expense_id")]
        public long ExpenseId { get; set; }

        [Required]
        [Column("fk_travel_id")]
        public long TravelId { get; set; }

        [Required]
        [Column("fk_employee_id")]
        public long EmployeeId { get; set; }

        [Required]
        [Column("fk_category_id")]
        public long CategoryId { get; set; }

        [Required]
        [Column("amount", TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        [Column("currency")]
        public string Currency {get; set;} = string.Empty;

        [Required]
        [Column("expense_date")]
        public DateTime ExpenseDate { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        public ExpenseStatus Status { get; set; } = ExpenseStatus.Draft;

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        [Column("reviewed_by")]
        public long? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("hr_remarks")]
        public string? HrRemarks { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TravelId")]
        public virtual Travel? Travel { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual User? Employee { get; set; }

        [ForeignKey("CategoryId")]
        public virtual ExpenseCategory? Category { get; set; }

        [ForeignKey("ReviewedBy")]
        public virtual User? Reviewer { get; set; }

        public ICollection<ExpenseProof> ProofDocuments { get; set; } = new List<ExpenseProof>();

    }

    public enum ExpenseStatus
    {
        Draft,
        Submitted,
        Approved,
        Rejected
    }
}
