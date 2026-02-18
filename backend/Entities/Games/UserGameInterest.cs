using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Games
{

    [Table("user_game_interests")]
    public class UserGameInterest
    {
        [Key]
        [Column("pk_interest_id")]
        public long InterestId { get; set; }

        [Required]
        [Column("fk_user_id")]
        public long UserId { get; set; }

        [Required]
        [Column("fk_game_id")]
        public long GameId { get; set; }

        [Column("is_interested")]
        public bool IsInterested { get; set; } = true;

        [Column("registered_at")]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("GameId")]
        public virtual Game? Game { get; set; }
    }

}
