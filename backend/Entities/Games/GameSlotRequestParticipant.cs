using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;

namespace backend.Entities.Games
{
    [Table("game_slot_request_participants")]
    public class GameSlotRequestParticipant
    {
        [Key]
        [Column("pk_request_participant_id")]
        public long RequestParticipantId { get; set; }

        [Required]
        [Column("fk_request_id")]
        public long RequestId { get; set; }

        [Required]
        [Column("fk_user_id")]
        public long UserId { get; set; }

        [ForeignKey("RequestId")]
        public virtual GameSlotRequest? Request { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}