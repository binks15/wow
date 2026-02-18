using backend.Entities.Travels;
 
namespace backend.Repositories.Travels;
 
public interface ITravelDocumentRepository
{
    Task<TravelDocument> AddAsync(TravelDocument document);
    Task<IReadOnlyCollection<TravelDocument>> GetAsync(long? travelId, long? employeeId);
    Task<IReadOnlyCollection<TravelDocument>> GetForEmployeeAsync(long employeeId,IReadOnlyCollection<long> assignedTravelIds,long? travelId);
    Task<IReadOnlyCollection<TravelDocument>> GetForManagerAsync(long employeeId,IReadOnlyCollection<long> assignedTravelIds,long? travelId);
    Task<TravelDocument?> GetByIdAsync(long documentId);
    Task SaveAsync();
    Task DeleteAsync(TravelDocument document);
}
 