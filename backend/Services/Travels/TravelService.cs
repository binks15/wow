using backend.DTO.Travels;
using backend.Services.Common;
using backend.Repositories.Travels;
using backend.Repositories.Common;
using backend.DTO.Common;
 
namespace backend.Services.Travels;
 
public class TravelService
{
    private readonly ITravelRepository _repository;
    private readonly IUserRepository _users;
    private readonly IExpenseRepository _expenses;
 
    private readonly NotificationService _notifications;
    // private readonly EmailService _email;
 
    public TravelService(ITravelRepository repository, IUserRepository users, IExpenseRepository expenses, NotificationService notifications
    // , EmailService email
    )
    {
        _repository = repository;
        _users = users;
        _expenses = expenses;
        _notifications = notifications;
        // _email = email;
    }
 
    public async Task<TravelResponseDto> CreateTravelAsync(TravelCreateDto dto, long currentUserId)
    {
        if (dto.StartDate > dto.EndDate)
        {
            throw new ArgumentException("Start date must be on or before end date.");
        }
 
        if (dto.Assignments is null || dto.Assignments.Count == 0)
        {
            throw new ArgumentException("At least one employee must be assigned.");
        }
 
 
        var employeeIds = dto.Assignments.Select(a => a.EmployeeId).Distinct().ToList();
        var employeesFound = await _users.GetExistingUserIdsAsync(employeeIds);
        if (employeesFound.Count != employeeIds.Count)
        {
            throw new ArgumentException("One or more assigned employees not found.");
        }
 
        var created = await _repository.CreateTravelAsync(dto, employeeIds, currentUserId);
 
        var employees = await _users.GetUsersByIdsAsync(employeeIds);
 
        var title = "New travel assigned";
        var message = $"You have been assigned to travel '{created.TravelName}' ({created.Destination}) from {created.StartDate} to {created.EndDate}.";
 
        await _notifications.CreateForUsersAsync(employees.Select(e => e.UserId), title, message);
 
        // foreach (var employee in employees)
        // {
        //     await _email.SendAsync(employee.Email, title, message);
        // }
 
 
        return created;
    }
 
 
    public async Task<IReadOnlyCollection<TravelAssignmentDto>> GetAssignmentsForEmployeeAsync(long employeeId, long? createdById)
    {
        return await _repository.GetAssignmentsForEmployeeAsync(employeeId, createdById);
    }
 
    public async Task<IReadOnlyCollection<EmployeeLookupDto>> GetAssigneesForTravelAsync(long travelId, long currentUserId)
    {
        var travel = await _repository.GetByIdAsync(travelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        if (travel.CreatedBy != currentUserId)
        {
            throw new ArgumentException("You can only view assignees for travels you created.");
        }
 
        return await _repository.GetAssigneesForTravelAsync(travelId);
    }
 
    public async Task<IReadOnlyCollection<TravelAssignedDto>> GetCreatedTravelsAsync(long createdById)
    {
        return await _repository.GetCreatedTravelsAsync(createdById);
    }
 
    public async Task<TravelResponseDto> GetTravelByIdAsync(long travelId)
    {
        var travel = await _repository.GetByIdWithAssignmentsAsync(travelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        var assignedEmployeeIds = travel.Assignments.Select(a => a.EmployeeId).ToList();
 
        var totalClaimedAmount = await _expenses.GetTotalClaimedAmountAsync(travelId);
 
        return new TravelResponseDto(
            travel.TravelId,
            travel.TravelName ?? string.Empty,
            travel.Destination ?? string.Empty,
            travel.Purpose,
            travel.StartDate,
            travel.EndDate,
            travel.CreatedBy,
            assignedEmployeeIds
            );
    }
 
    public async Task<TravelResponseDto> UpdateTravelAsync(long travelId, TravelUpdateDto dto, long currentUserId)
    {
        if (dto.StartDate > dto.EndDate)
        {
            throw new ArgumentException("Start date must be on or before end date.");
        }
 
        var travel = await _repository.GetByIdAsync(travelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        if (travel.CreatedBy != currentUserId)
        {
            throw new ArgumentException("You can only update travels you created.");
        }
 
        travel.TravelName = dto.TravelName;
        travel.Destination = dto.Destination;
        travel.Purpose = dto.Purpose;
        travel.StartDate = dto.StartDate;
        travel.EndDate = dto.EndDate;
        travel.UpdatedAt = DateTime.UtcNow;
 
        if (dto.AssignedEmployeeIds is not null)
        {
            if (dto.AssignedEmployeeIds.Count == 0)
            {
                throw new ArgumentException("At least one employee must be assigned.");
            }
 
            var employeeIds = dto.AssignedEmployeeIds.Distinct().ToList();
            var employeesFound = await _users.GetExistingUserIdsAsync(employeeIds);
 
            if (employeesFound.Count != employeeIds.Count)
            {
                throw new ArgumentException("One or more assigned employees not found.");
            }
 
            await _repository.UpdateAssignmentsAsync(travelId, employeeIds);
        }
 
        await _repository.SaveAsync();
 
        var assignedEmployeeIds = await _repository.GetAssignedEmployeeIdsAsync(travelId);
 
        var totalClaimedAmount = await _expenses.GetTotalClaimedAmountAsync(travelId);
 
    
 
        return new TravelResponseDto(
            travel.TravelId,
            travel.TravelName ?? string.Empty,
            travel.Destination ?? string.Empty,
            travel.Purpose,
            travel.StartDate,
            travel.EndDate,
            travel.CreatedBy,
            assignedEmployeeIds
            );
    }
 
    public async Task DeleteTravelAsync(long travelId, long currentUserId)
    {
        var travel = await _repository.GetByIdAsync(travelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        if (travel.CreatedBy != currentUserId)
        {
            throw new ArgumentException("You can only delete travels you created.");
        }
 
       
        await _repository.DeleteAsync(travel);
    }
 
}
 