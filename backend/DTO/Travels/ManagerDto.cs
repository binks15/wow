namespace backend.DTO.Travels;

public record TeamMemberDto(
    long Id,
    string FullName,
    string Email,
    string? Department,
    string? Designation
);

public record TeamExpenseDto(
    long ExpenseId,
    long EmployeeId,
    long TravelId,
    long CategoryId,
    decimal Amount,
    string Currency,
    DateTime ExpenseDate,
    string Status
);