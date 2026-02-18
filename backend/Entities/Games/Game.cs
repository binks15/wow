using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities.Games
{
    [Table("games")]
    public class Game
    {
        [Key]
        [Column("pk_game_id")]
        public long GameId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("game_name")]
        public string? GameName { get; set; }

        [Column("operating_hours_start")]
        public TimeSpan OperatingHoursStart { get; set; } = TimeSpan.Zero;

        [Column("operating_hours_end")]
        public TimeSpan OperatingHoursEnd { get; set; } = new TimeSpan(23, 59, 59);

        [Column("slot_duration_minutes")]
        public int SlotDurationMinutes { get; set; } = 30;

        [Column("max_players_per_slot")]
        public int MaxPlayersPerSlot { get; set; } = 2;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GameSlot> Slots { get; set; } = new List<GameSlot>();

        public ICollection<GameBooking> Bookings { get; set; } = new List<GameBooking>();

        public ICollection<GameHistory> Histories { get; set; } = new List<GameHistory>();
    }

}