using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Games
{
    [Table("game_bookings")]
    public class GameBooking
    {
        [Key]
        [Column("pk_booking_id")]
        public long BookingId { get; set; }

        [Required]
        [Column("fk_game_id")]
        public long GameId { get; set; }

        [Required]
        [Column("fk_slot_id")]
        public long SlotId { get; set; }

        [Required]
        [Column("booking_date")]
        public DateTime BookingDate { get; set; }

        [Required]
        [Column("slot_start_time")]
        public TimeSpan SlotStartTime { get; set; }

        [Required]
        [Column("slot_end_time")]
        public TimeSpan SlotEndTime { get; set; }

        [Column("status")]
        public BookingStatus Status { get; set; } = BookingStatus.Booked;

        [Required]
        [Column("fk_created_by")]
        public long CreatedBy { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        [ForeignKey("GameId")]
        public virtual Game? Game { get; set; }

        [ForeignKey("SlotId")]
        public virtual GameSlot? Slot { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        public ICollection<GameBookingParticipant> Participants { get; set; } = new List<GameBookingParticipant>();

    }

    public enum BookingStatus
    {
        Booked,
        Completed,
        Cancelled
    }
}