using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Entities.Common;
 
namespace backend.Entities.Travels
{
 
    [Table("travel_documents")]
    public class TravelDocument
    {
        [Key]
        [Column("pk_document_id")]
        public long DocumentId { get; set; }
 
        [Required]
        [Column("fk_travel_id")]
        public long TravelId { get; set; }
 
        [Column("fk_employee_id")]
        public long? EmployeeId { get; set; }
 
        [Required]
        [Column("fk_uploaded_by")]
        public long UploadedBy { get; set; }
 
        [Required]
        [Column("owner_type")]
        public DocumentOwnerType OwnerType { get; set; }
 
        [Required]
        [MaxLength(100)]
        [Column("document_type")]
        public string? DocumentType { get; set; }
 
        [Required]
        [MaxLength(255)]
        [Column("file_name")]
        public string? FileName { get; set; }
 
        [Required]
        [MaxLength(500)]
        [Column("file_path")]
        public string? FilePath { get; set; }
 
 
        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
 
        [ForeignKey("TravelId")]
        public virtual Travel? Travel { get; set; }
 
        [ForeignKey("EmployeeId")]
        public virtual User? Employee { get; set; }
 
        [ForeignKey("UploadedBy")]
        public virtual User? Uploader { get; set; }
    }
 
    public enum DocumentOwnerType
    {
        HR,
        Employee
    }
 
}
 