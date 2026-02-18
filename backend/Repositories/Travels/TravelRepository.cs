using backend.Data;
using backend.Entities.Travels;
using backend.DTO.Travels;
using Microsoft.EntityFrameworkCore;
using backend.DTO.Common;

namespace backend.Repositories.Travels;

public class TravelRepository : ITravelRepository
{
    private readonly AppDbContext _db;

    public TravelRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TravelResponseDto> CreateTravelAsync(TravelCreateDto dto, IReadOnlyCollection<long> employeeIds, long currentUserId)
    {
        var travel = new Travel
        {
            TravelName = dto.TravelName,
            Destination = dto.Destination,
            Purpose = dto.Purpose,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CreatedBy = currentUserId
        };

        foreach (var employeeId in employeeIds)
        {
            travel.Assignments.Add(new TravelAssignment
            {
                EmployeeId = employeeId
            });
        }

        _db.Travels.Add(travel);
        await _db.SaveChangesAsync();

        return new TravelResponseDto(
            travel.TravelId,
            travel.TravelName,
            travel.Destination,
            travel.Purpose,
            travel.StartDate,
            travel.EndDate,
            travel.CreatedBy,
            travel.Assignments.Select(a => a.EmployeeId).ToList());
    }

    public async Task<IReadOnlyCollection<TravelAssignmentDto>> GetAssignmentsForEmployeeAsync(long employeeId, long? createdById)
    {
        var query = _db.TravelAssignments
            .Where(a => a.EmployeeId == employeeId)
            .Include(a => a.Travel)
            .ThenInclude(t => t.Assignments)
            .AsQueryable();

        if (createdById.HasValue)
        {
            query = query.Where(a => a.Travel != null && a.Travel.CreatedBy == createdById.Value);
        }

        return await query
            .Select(a => new TravelAssignmentDto(
                a.AssignmentId,
                a.Travel!.TravelId,
                a.Travel.TravelName!,
                a.Travel.Destination!,
                a.Travel.Purpose,
                a.Travel.StartDate,
                a.Travel.EndDate,
                a.Travel.Assignments.Select(assignment => assignment.EmployeeId).ToList()
            ))
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<TravelAssignedDto>> GetCreatedTravelsAsync(long createdById)
    {
        return await _db.Travels
            .Where(t => t.CreatedBy == createdById)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TravelAssignedDto(
                t.TravelId,
                t.TravelName ?? string.Empty,
                t.Destination ?? string.Empty,
                t.StartDate,
                t.EndDate
            ))
            .ToListAsync();
    }

    public async Task<Travel?> GetByIdAsync(long travelId)
    {
        return await _db.Travels.FirstOrDefaultAsync(t => t.TravelId == travelId);
    }

    public async Task<Travel?> GetByIdWithAssignmentsAsync(long travelId)
    {
        return await _db.Travels
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t => t.TravelId == travelId);
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Travel travel)
    {
        _db.Travels.Remove(travel);
        await _db.SaveChangesAsync();
    }

    public async Task<TravelAssignment?> GetAssignmentWithTravelAsync(long assignmentId)
    {
        return await _db.TravelAssignments
            .Include(a => a.Travel)
            .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);
    }
 
    public async Task<bool> TravelExistsAsync(long travelId)
    {
        return await _db.Travels.AnyAsync(t => t.TravelId == travelId);
    }
 
    public async Task<bool> IsEmployeeAssignedAsync(long travelId, long employeeId)
    {
        return await _db.TravelAssignments
            .AnyAsync(a => a.TravelId == travelId && a.EmployeeId == employeeId);
    }
 
    public async Task<IReadOnlyCollection<long>> GetAssignedTravelIdsForEmployeeAsync(long employeeId)
    {
        return await _db.TravelAssignments
            .Where(a => a.EmployeeId == employeeId)
            .Select(a => a.TravelId)
            .ToListAsync();
    }
 
    public async Task<IReadOnlyCollection<long>> GetAssignedEmployeeIdsAsync(long travelId)
    {
        return await _db.TravelAssignments
            .Where(a => a.TravelId == travelId)
            .Select(a => a.EmployeeId)
            .ToListAsync();
    }
 
    public async Task UpdateAssignmentsAsync(long travelId, IReadOnlyCollection<long> employeeIds)
    {
        var existingAssignments = await _db.TravelAssignments
            .Where(a => a.TravelId == travelId)
            .ToListAsync();
 
        var existingEmployeeIds = existingAssignments
            .Select(a => a.EmployeeId)
            .ToHashSet();
        var incomingEmployeeIds = employeeIds.ToHashSet();
 
        var assignmentsToRemove = existingAssignments
            .Where(a => !incomingEmployeeIds.Contains(a.EmployeeId))
            .ToList();
        if (assignmentsToRemove.Count > 0)
        {
            _db.TravelAssignments.RemoveRange(assignmentsToRemove);
        }
 
        var assignmentsToAdd = employeeIds
            .Where(employeeId => !existingEmployeeIds.Contains(employeeId))
            .ToList();
 
        if (assignmentsToAdd.Count > 0)
        {
            foreach (var employeeId in assignmentsToAdd)
            {
                _db.TravelAssignments.Add(new TravelAssignment
                {
                    TravelId = travelId,
                    EmployeeId = employeeId
                });
            }
        }
    }
 
    public async Task<IReadOnlyCollection<EmployeeLookupDto>> GetAssigneesForTravelAsync(long travelId)
    {
        return await _db.TravelAssignments
            .Where(a => a.TravelId == travelId)
            .Join(
                _db.Users,
                assignment => assignment.EmployeeId,
                user => user.UserId,
                (_, user) => new EmployeeLookupDto(
                    user.UserId,
                    user.FullName,
                    user.Email
                )
            )
            .ToListAsync();
    }
 
}