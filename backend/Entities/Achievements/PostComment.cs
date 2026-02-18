using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Achievements
{
    [Table("post_comments")]
    public class PostComment
    {
        [Key]
        [Column("pk_comment_id")]
        public long CommentId { get; set; }

        [Required]
        [Column("fk_post_id")]
        public long PostId { get; set; }

        [Required]
        [Column("fk_author_id")]
        public long AuthorId { get; set; }

        [Required]
        [Column("comment_text")]
        public string? CommentText { get; set; }

        [Column("fk_parent_comment_id")]
        public long? ParentCommentId { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PostId")]
        public virtual AchievementPost? Post { get; set; }

        [ForeignKey("AuthorId")]
        public virtual User? Author { get; set; }

        [ForeignKey("ParentCommentId")]
        public virtual PostComment? ParentComment { get; set; }

       
    }

}
