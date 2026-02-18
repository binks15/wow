using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Travels
{

    public record TravelAssignmentCreateDto(
        [Required] long EmployeeId
    );

    public record TravelCreateDto(
        [Required, MaxLength(200)] string TravelName,
        [Required, MaxLength(200)] string Destination,
        [MaxLength(2000)] string? Purpose,
        [Required] DateTime StartDate,
        [Required] DateTime EndDate,
         long? CreatedById,
        [MinLength(1)] List<TravelAssignmentCreateDto> Assignments
    );

    public record TravelUpdateDto(
        [Required, MaxLength(200)] string TravelName,
        [Required, MaxLength(200)] string Destination,
        [MaxLength(2000)] string? Purpose,
        [Required] DateTime StartDate,
        [Required] DateTime EndDate,
        List<long>? AssignedEmployeeIds
    );

    public record TravelResponseDto(
        long TravelId,
        string TravelName,
        string Destination,
        string? Purpose,
        DateTime StartDate,
        DateTime EndDate,
        long CreatedById,
        IReadOnlyCollection<long> AssignedEmployeeIds
    );

    public record TravelAssignedDto(
        long TravelId,
        string TravelName,
        string Destination,
        DateTime StartDate,
        DateTime EndDate
    );

    public record TravelAssignmentDto(
        long AssignId,
        long TravelId,
        string TravelName,
        string Destination,
        string? Purpose,
        DateTime StartDate,
        DateTime EndDate,
        IReadOnlyCollection<long> AssignedEmployeeIds
    );
}