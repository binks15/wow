using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities.Common
{
    [Table("user_refresh_tokens")]
    public class UserRefreshToken
    {
        [Key]
        public long Id { get; set; }

        public long UserId { get; set; }

        public User? User { get; set; }

        [Required, MaxLength(500)]
        public string TokenHash { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [MaxLength(500)]
        public string? ReplacedByTokenHash { get; set; }

        public bool IsRevoked => RevokedAt != null;

        public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpiresAt;
    }
}
