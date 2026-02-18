using backend.Entities.Travels;
using backend.DTO.Travels;
using backend.Services.Common;
using backend.Repositories.Travels;
using backend.Repositories.Common;
 
namespace backend.Services.Travels;
 
public class TravelDocumentService
{
    private readonly ITravelDocumentRepository _repository;
    private readonly ITravelRepository _travels;
    private readonly IUserRepository _users;
    private readonly CloudinaryService _cloudinary;
 
    public TravelDocumentService(ITravelDocumentRepository repository, ITravelRepository travels, IUserRepository users, CloudinaryService cloudinary)
    {
        _repository = repository;
        _travels = travels;
        _users = users;
        _cloudinary = cloudinary;
    }
 
    public async Task<TravelDocumentDto> UploadAsync(TravelDocumentUploadDto dto, long currentUserId, string role)
    {
        if (role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Managers cannot upload travel documents.");
        }
 
        var employeeId = dto.EmployeeId;
        if (role.Equals("Employee", StringComparison.OrdinalIgnoreCase))
        {
            employeeId = currentUserId;
        }
 
        if (role.Equals("HR", StringComparison.OrdinalIgnoreCase) && !employeeId.HasValue)
        {
            var travelExists = await _travels.TravelExistsAsync(dto.TravelId);
            if (!travelExists)
            {
                throw new ArgumentException("Travel not found.");
            }
        }
        else if (!employeeId.HasValue)
        {
            throw new ArgumentException("EmployeeId is required for this upload.");
        }
 
        if (employeeId.HasValue)
        {
            var assignmentExists = await _travels.IsEmployeeAssignedAsync(dto.TravelId, employeeId.Value);
 
            if (!assignmentExists)
            {
                throw new ArgumentException("Employee is not assigned to this travel.");
            }
        }
 
        var upload = await _cloudinary.UploadAsync(dto.File, "travel-documents");
        var document = new TravelDocument
        {
            TravelId = dto.TravelId,
            EmployeeId = employeeId,
            UploadedBy = currentUserId,
            OwnerType = role.Equals("HR")
                ? DocumentOwnerType.HR
                : DocumentOwnerType.Employee,
            DocumentType = dto.DocumentType,
            FileName = upload.FileName,
            FilePath = upload.Url,
            UploadedAt = DateTime.UtcNow
        };
 
        var saved = await _repository.AddAsync(document);
 
        var uploaderName = await _users.GetUserFullNameAsync(currentUserId);
 
        return new TravelDocumentDto(
            saved.DocumentId,
            saved.TravelId,
            saved.EmployeeId,
            saved.UploadedBy,
            uploaderName,
            saved.OwnerType.ToString(),
            saved.DocumentType,
            saved.FileName,
            saved.FilePath,
            saved.UploadedAt);
    }
 
    public async Task<IReadOnlyCollection<TravelDocumentDto>> ListAsync(long currentUserId, string role, long? travelId, long? employeeId)
    {
        if (role.Equals("Employee", StringComparison.OrdinalIgnoreCase))
        {
            var assignedTravelIds = await _travels.GetAssignedTravelIdsForEmployeeAsync(currentUserId);
            var documents = await _repository.GetForEmployeeAsync(currentUserId, assignedTravelIds, travelId);
 
            return await MapDocumentsAsync(documents);
        }
        else if (role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
        {
            if (!employeeId.HasValue)
            {
                throw new ArgumentException("employeeId is required for manager view.");
            }
 
            var isTeamMember = await _users.IsTeamMemberAsync(currentUserId, employeeId.Value);
 
            if (!isTeamMember)
            {
                throw new ArgumentException("Manager can only view team member documents.");
            }
 
            var assignedTravelIds = await _travels.GetAssignedTravelIdsForEmployeeAsync(employeeId.Value);
            var documents = await _repository.GetForManagerAsync(employeeId.Value, assignedTravelIds, travelId);
 
            return await MapDocumentsAsync(documents);
        }
 
        var hrDocuments = await _repository.GetAsync(travelId, employeeId);
        return await MapDocumentsAsync(hrDocuments);
    }
 
    public async Task<TravelDocumentDto> UpdateAsync(long documentId, TravelDocumentUpdateDto dto, long currentUserId)
    {
        var document = await _repository.GetByIdAsync(documentId);
        if (document is null)
        {
            throw new ArgumentException("Document not found.");
        }
 
        if (document.UploadedBy != currentUserId)
        {
            throw new ArgumentException("You can only update documents you uploaded.");
        }
 
        if (!string.IsNullOrWhiteSpace(dto.DocumentType))
        {
            document.DocumentType = dto.DocumentType;
        }
 
        if (dto.File is not null)
        {
            var upload = await _cloudinary.UploadAsync(dto.File, "travel-documents");
            document.FileName = upload.FileName;
            document.FilePath = upload.Url;
            document.UploadedAt = DateTime.UtcNow;
        }
 
        await _repository.SaveAsync();
 
        var uploaderName = await _users.GetUserFullNameAsync(document.UploadedBy);
 
        return new TravelDocumentDto(
            document.DocumentId,
            document.TravelId,
            document.EmployeeId,
            document.UploadedBy,
            uploaderName,
            document.OwnerType.ToString(),
            document.DocumentType,
            document.FileName,
            document.FilePath,
            document.UploadedAt);
    }
 
    public async Task DeleteAsync(long documentId, long currentUserId)
    {
        var document = await _repository.GetByIdAsync(documentId);
        if (document is null)
        {
            throw new ArgumentException("Document not found.");
        }
 
        if (document.UploadedBy != currentUserId)
        {
            throw new ArgumentException("You can only delete documents you uploaded.");
        }
 
        await _repository.DeleteAsync(document);
    }
 
    private async Task<IReadOnlyCollection<TravelDocumentDto>> MapDocumentsAsync(IReadOnlyCollection<TravelDocument> documents)
    {
        if (documents.Count == 0)
        {
            return Array.Empty<TravelDocumentDto>();
        }
 
        var uploaderIds = documents
            .Select(d => d.UploadedBy)
            .Distinct()
            .ToList();
 
        var uploaderNames = await _users.GetUsersNamesByIdsAsync(uploaderIds);
 
        return documents.Select(d => new TravelDocumentDto(
            d.DocumentId,
            d.TravelId,
            d.EmployeeId,
            d.UploadedBy,
            uploaderNames.GetValueOrDefault(d.UploadedBy),
            d.OwnerType.ToString(),
            d.DocumentType,
            d.FileName,
            d.FilePath,
            d.UploadedAt)).ToList();
    }
}
 