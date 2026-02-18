using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Games
{
    [Table("game_slot_requests")]
    public class GameSlotRequest
    {
        [Key]
        [Column("pk_request_id")]
        public long RequestId { get; set; }

        [Required]
        [Column("fk_slot_id")]
        public long SlotId { get; set; }

        [Required]
        [Column("fk_requested_by")]
        public long RequestedBy { get; set; }

        [Column("status")]
        public GameSlotRequestStatus Status { get; set; } = GameSlotRequestStatus.Pending;

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SlotId")]
        public virtual GameSlot? Slot { get; set; }

        [ForeignKey("RequestedBy")]
        public virtual User? Requester { get; set; }

        public ICollection<GameSlotRequestParticipant> Participants { get; set; } = new List<GameSlotRequestParticipant>();
    }

    public enum GameSlotRequestStatus
    {
        Pending,
        Assigned,
        Waitlisted,
        Cancelled,
        Rejected
    }
}