using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities.Games
{
    [Table("game_slots")]
    public class GameSlot
    {
        [Key]
        [Column("pk_slot_id")]
        public long SlotId { get; set; }

        [Required]
        [Column("fk_game_id")]
        public long GameId { get; set; }

        [Required]
        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Required]
        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("status")]
        public GameSlotStatus Status { get; set; } = GameSlotStatus.Open;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("GameId")]
        public virtual Game? Game { get; set; }

        public ICollection<GameSlotRequest> Requests { get; set; } = new List<GameSlotRequest>();

        public ICollection<GameBooking> Bookings { get; set; } = new List<GameBooking>();
    }

    public enum GameSlotStatus
    {
        Open,
        Locked,
        Booked,
        Cancelled
    }
}