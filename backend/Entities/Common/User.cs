using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Travels;
namespace backend.Entities.Common
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("pk_user_id")]
        public long UserId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public  string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("password_salt")]
        public string PasswordSalt {get; set;} = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Required]
        [Column("date_of_joining")]
        public DateTime DateOfJoining { get; set; }

        [MaxLength(500)]
        [Column("profile_photo_url")]
        public string? ProfilePhotoUrl { get; set; }

        [MaxLength(100)]
        [Column("department")]
        public string? Department { get; set; }

        [MaxLength(100)]
        [Column("designation")]
        public string? Designation { get; set; }

        [Column("fk_manager_id")]
        public long? ManagerId { get; set; }

        [Required]
        [Column("fk_role_id")]
        public long? RoleId { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("hash_refresh_token")]
        public string? RefreshTokenHash { get; set; }

        [Column("refresh_token_expiry")]
        public DateTime? RefreshTokenExpiryTime { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ManagerId")]
        public virtual User? Manager { get; set; }

        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }

    
    public ICollection<User> DirectReports { get; set; } = new List<User>();

    public ICollection<Travel> TravelsCreated { get; set; } = new List<Travel>();

    public ICollection<TravelAssignment> TravelAssignments { get; set; } = new List<TravelAssignment>();

    public ICollection<TravelDocument> TravelDocumentsUploaded { get; set; } = new List<TravelDocument>();

    public ICollection<Expense> ExpensesReviewed { get; set; } = new List<Expense>();

    public ICollection<UserRefreshToken> RefreshTokens { get; set; } = new List<UserRefreshToken>();
    }

 
}

 

