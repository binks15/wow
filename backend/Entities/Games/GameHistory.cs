using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Games
{
    [Table("game_history")]
    public class GameHistory
    {
        [Key]
        [Column("pk_stat_id")]
        public long StatId { get; set; }

        [Required]
        [Column("fk_user_id")]
        public long UserId { get; set; }

        [Required]
        [Column("fk_game_id")]
        public long GameId { get; set; }

        [Required]
        [Column("cycle_start_date")]
        public DateTime CycleStartDate { get; set; }

        [Required]
        [Column("cycle_end_date")]
        public DateTime CycleEndDate { get; set; }

        [Column("slots_played")]
        public int SlotsPlayed { get; set; } = 0;

        [Column("last_played_date")]
        public DateTime? LastPlayedDate { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("GameId")]
        public virtual Game? Game { get; set; }
    }

}
