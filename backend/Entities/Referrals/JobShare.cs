using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Referrals
{
    [Table("job_shares")]
    public class JobShare
    {
        [Key]
        [Column("pk_share_id")]
        public long ShareId { get; set; }

        [Required]
        [Column("fk_job_id")]
        public long JobId { get; set; }

        [Required]
        [Column("fk_shared_by")]
        public long SharedBy { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("recipient_email")]
        public string? RecipientEmail { get; set; }

        [Column("shared_at")]
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("JobId")]
        public virtual JobOpening? Job { get; set; }

        [ForeignKey("SharedBy")]
        public virtual User? Sharer { get; set; }
    }

}
