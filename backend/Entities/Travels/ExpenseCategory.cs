using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities.Travels
{
    [Table("expense_categories")]
    public class ExpenseCategory
    {
        [Key]
        [Column("pk_category_id")]
        public long CategoryId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("category_name")]
        public string? CategoryName { get; set; }

        [Column("max_amount_per_day", TypeName = "decimal(10,2)")]
        public decimal? MaxAmountPerDay { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }

}
