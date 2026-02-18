using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Travels
{
    [Table("travel_assignments")]
    public class TravelAssignment
    {
        [Key]
        [Column("pk_assignment_id")]
        public long AssignmentId { get; set; }

        [Required]
        [Column("fk_travel_id")]
        public long TravelId { get; set; }

        [Required]
        [Column("fk_employee_id")]
        public long EmployeeId { get; set; }


        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TravelId")]
        public virtual Travel? Travel { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual User? Employee { get; set; }
    }
}
