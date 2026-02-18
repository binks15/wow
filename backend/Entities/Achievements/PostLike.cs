using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Achievements
{

    [Table("post_likes")]
    public class PostLike
    {
        [Key]
        [Column("pk_like_id")]
        public long LikeId { get; set; }

        [Required]
        [Column("fk_post_id")]
        public long PostId { get; set; }

        [Required]
        [Column("fk_user_id")]
        public long UserId { get; set; }

        [Column("liked_at")]
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PostId")]
        public virtual AchievementPost? Post { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }

}
