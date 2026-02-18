using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Travels
{

    [Table("travels")]
    public class Travel
    {
        [Key]
        [Column("pk_travel_id")]
        public long TravelId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("travel_name")]
        public string? TravelName { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("destination")]
        public string? Destination { get; set; }

        [Column("purpose")]
        public string? Purpose { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Required]
        [Column("fk_created_by")]
        public long CreatedBy { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        public ICollection<TravelAssignment> Assignments { get; set; } = new List<TravelAssignment>();

        public ICollection<TravelDocument> Documents { get; set; } = new List<TravelDocument>();

        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    }

}
