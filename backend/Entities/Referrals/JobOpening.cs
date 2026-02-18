using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Referrals
{
    [Table("job_openings")]
    public class JobOpening
    {
        [Key]
        [Column("pk_job_id")]
        public long JobId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("job_title")]
        public string? JobTitle { get; set; }

        [MaxLength(100)]
        [Column("department")]
        public string? Department { get; set; }

        [MaxLength(255)]
        [Column("location")]
        public string? Location { get; set; }

        [Column("job_type")]
        public JobType JobType { get; set; } = JobType.FullTime;

        [MaxLength(50)]
        [Column("experience_required")]
        public string? ExperienceRequired { get; set; }

        [Column("job_summary")]
        public string? JobSummary { get; set; }

        [MaxLength(500)]
        [Column("job_description_path")]
        public string? JobDescriptionPath { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [MaxLength(255)]
        [Column("hr_owner_email")]
        public string? HrOwnerEmail { get; set; }

        [Column("cv_reviewer_emails")]
        public string? CvReviewerEmails { get; set; }

        [Column("fk_posted_by")]
        public long? PostedBy { get; set; }

        [Column("posted_at")]
        public DateTime PostedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PostedBy")]
        public virtual User? Poster { get; set; }

    
    }

    public enum JobType
    {
        FullTime,
        PartTime,
        Internship
    }
}
