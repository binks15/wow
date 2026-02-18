using backend.Data;
using backend.Entities.Travels;
using Microsoft.EntityFrameworkCore;
 
namespace backend.Repositories.Travels
{
 
    public class TravelDocumentRepository : ITravelDocumentRepository
    {
        private readonly AppDbContext _db;
 
        public TravelDocumentRepository(AppDbContext db)
        {
            _db = db;
        }
 
        public async Task<TravelDocument> AddAsync(TravelDocument document)
        {
            _db.TravelDocuments.Add(document);
            await _db.SaveChangesAsync();
            return document;
        }
 
        public async Task<IReadOnlyCollection<TravelDocument>> GetAsync(long? travelId, long? employeeId)
        {
            var query = _db.TravelDocuments.AsNoTracking().AsQueryable();
 
            if (travelId.HasValue)
            {
                query = query.Where(d => d.TravelId == travelId.Value);
            }
 
            if (employeeId.HasValue)
            {
                query = query.Where(d => d.EmployeeId == employeeId.Value);
            }
 
            return await query
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }
 
        public async Task<TravelDocument?> GetByIdAsync(long documentId)
        {
            return await _db.TravelDocuments.FirstOrDefaultAsync(d => d.DocumentId == documentId);
        }
 
        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }
 
        public async Task DeleteAsync(TravelDocument document)
        {
            _db.TravelDocuments.Remove(document);
            await _db.SaveChangesAsync();
        }

        public async Task<IReadOnlyCollection<TravelDocument>> GetForEmployeeAsync(long employeeId, IReadOnlyCollection<long> assignedTravelIds, long? travelId)
        {
            var query = _db.TravelDocuments
                .AsNoTracking()
                .Where(d =>
                    (d.EmployeeId == employeeId) ||
                    (d.OwnerType == DocumentOwnerType.HR && d.EmployeeId == null && assignedTravelIds.Contains(d.TravelId))
                )
                .AsQueryable();
 
            if (travelId.HasValue)
            {
                query = query.Where(d => d.TravelId == travelId.Value);
            }
 
            return await query
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }
 
        public async Task<IReadOnlyCollection<TravelDocument>> GetForManagerAsync(long employeeId, IReadOnlyCollection<long> assignedTravelIds, long? travelId)
        {
            var query = _db.TravelDocuments
                .AsNoTracking()
                .Where(d =>
                    (d.EmployeeId == employeeId) ||
                    (d.OwnerType == DocumentOwnerType.HR && d.EmployeeId == null && assignedTravelIds.Contains(d.TravelId))
                )
                .AsQueryable();
 
            if (travelId.HasValue)
            {
                query = query.Where(d => d.TravelId == travelId.Value);
            }
 
            return await query
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }
 
 
    }
}
 