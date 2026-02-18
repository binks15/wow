using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Referrals
{
    [Table("referrals")]
    public class Referral
    {
        [Key]
        [Column("pk_referral_id")]
        public long ReferralId { get; set; }

        [Required]
        [Column("fk_job_id")]
        public long JobId { get; set; }

        [Required]
        [Column("fk_referred_by")]
        public long ReferredBy { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("friend_name")]
        public string? FriendName { get; set; }

        [MaxLength(255)]
        [Column("friend_email")]
        public string? FriendEmail { get; set; }

        [Required]
        [MaxLength(500)]
        [Column("cv_file_path")]
        public string? CvFilePath { get; set; }

        [Column("note")]
        public string? Note { get; set; }

        [Column("status")]
        public ReferralStatus Status { get; set; } = ReferralStatus.New;

        [Column("hr_recipients")]
        public string? HrRecipients { get; set; }

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [Column("status_updated_at")]
        public DateTime? StatusUpdatedAt { get; set; }

        [Column("fk_status_updated_by")]
        public long? StatusUpdatedBy { get; set; }

        [ForeignKey("JobId")]
        public virtual JobOpening? Job { get; set; }

        [ForeignKey("ReferredBy")]
        public virtual User? Referrer { get; set; }

        [ForeignKey("StatusUpdatedBy")]
        public virtual User? StatusUpdater { get; set; }
    }

    public enum ReferralStatus
    {
        New,
        InReview,
        Shortlisted,
        Rejected,
        Hired
    }
}
