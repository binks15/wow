namespace backend.DTO.Common;

public record EmployeeLookupDto(
    long Id,
    string FullName,
    string Email
);
public record UserResponseDto(
    long Id,
    string FullName,
    string Email,
    string Phone,
    DateTime? DateOfBirth,
    DateTime DateOfJoining,
    string? ProfilePhotoUrl,
    string? Department,
    string? Designation,
    string? Manager,
    string? Role
);

public record UserProfileUpdateDto(
    string? FullName,
    string? Phone,
    DateTime? DateOfBirth,
    string? ProfilePhotoUrl,
    string? Department,
    string? Designation
);

public record OrgChartUserDto(
    long Id,
    string FullName,
    string Email,
    string? Department,
    string? Designation,
    string? ProfilePhotoUrl,
    long? ManagerId
);

public record OrgChartNodeDto(
    long Id,
    string FullName,
    string Email,
    string? Department,
    string? Designation,
    string? ProfilePhotoUrl,
    long? ManagerId,
    List<OrgChartNodeDto> DirectReports
);