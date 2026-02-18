using backend.DTO.Common;
using backend.DTO.Travels;
using backend.Entities.Travels;

namespace backend.Repositories.Travels;

public interface ITravelRepository
{
    Task<TravelResponseDto> CreateTravelAsync(TravelCreateDto dto, IReadOnlyCollection<long> employeeIds, long currentUserId);
    Task<IReadOnlyCollection<TravelAssignmentDto>> GetAssignmentsForEmployeeAsync(long employeeId, long? createdById);
    Task<IReadOnlyCollection<TravelAssignedDto>> GetCreatedTravelsAsync(long createdById);
    Task<Travel?> GetByIdAsync(long travelId);
    Task<Travel?> GetByIdWithAssignmentsAsync(long travelId);
    Task<TravelAssignment?> GetAssignmentWithTravelAsync(long assignmentId);
    Task<bool> TravelExistsAsync(long travelId);
    Task<bool> IsEmployeeAssignedAsync(long travelId, long employeeId);
    Task<IReadOnlyCollection<long>> GetAssignedTravelIdsForEmployeeAsync(long employeeId);
    Task<IReadOnlyCollection<long>> GetAssignedEmployeeIdsAsync(long travelId);
    Task UpdateAssignmentsAsync(long travelId, IReadOnlyCollection<long> employeeIds);
    Task<IReadOnlyCollection<EmployeeLookupDto>> GetAssigneesForTravelAsync(long travelId);
    Task SaveAsync();
    Task DeleteAsync(Travel travel);
}