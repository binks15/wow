using backend.Repositories.Travels;
using backend.Repositories.Common;
using backend.Services.Common;
using backend.Entities.Travels;
using backend.Config;
using backend.DTO.Travels;
 
namespace backend.Services.Travels;
 
public class ExpenseService
{
    private readonly IExpenseRepository _expenses;
    private readonly IExpenseProofRepository _documents;
    private readonly ITravelRepository _travels;
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IExpenseCategoryRepository _categories;
    private readonly CloudinaryService _cloudinary;
    private readonly NotificationService _notifications;
    // private readonly EmailService _email;
    // private readonly IOptions<EmailSettings> _emailSettings;
 
    public ExpenseService(IExpenseRepository expenses, IExpenseProofRepository documents, ITravelRepository travels, IUserRepository users, IRoleRepository roles, IExpenseCategoryRepository categories, CloudinaryService cloudinary, NotificationService notifications
    // , EmailService email, IOptions<EmailSettings> emailSettings
    )
    {
        _expenses = expenses;
        _documents = documents;
        _travels = travels;
        _users = users;
        _roles = roles;
        _categories = categories;
        _cloudinary = cloudinary;
        _notifications = notifications;
        // _email = email;
        // _emailSettings = emailSettings;
    }
 
    public async Task<ExpenseResponseDto> CreateDraftAsync(ExpenseCreateDto dto, long currentUserId)
    {
        var assignment = await _travels.GetAssignmentWithTravelAsync(dto.AssignId);
 
        if (assignment is null)
        {
            throw new ArgumentException("Assignment not found.");
        }
 
        if (assignment.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only create expenses for your own travel.");
        }
 
        ValidateExpenseWindow(dto.ExpenseDate, assignment.Travel!);
        await ValidateAmountAsync(dto.CategoryId, dto.Amount);
 
        var expense = new Expense
        {
            TravelId = assignment.TravelId,
            EmployeeId = assignment.EmployeeId,
            CategoryId = dto.CategoryId,
            Amount = dto.Amount,
            Currency = dto.Currency,
            ExpenseDate = dto.ExpenseDate,
            Status = ExpenseStatus.Draft
        };
 
        var saved = await _expenses.AddAsync(expense);
        return Map(saved);
    }
 
    public async Task UploadProofAsync(long expenseId, ExpenseProofUploadDto dto, long currentUserId)
    {
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only upload proofs for your own expense.");
        }
 
        var upload = await _cloudinary.UploadAsync(dto.File, "expense-proofs");
 
        var document = new ExpenseProof
        {
            ExpenseId = expenseId,
            FileName = upload.FileName,
            FilePath = upload.Url,
            FileType = dto.File.ContentType.Contains("pdf", StringComparison.OrdinalIgnoreCase)
                ? ExpenseFileType.Pdf
                : ExpenseFileType.Image,
            UploadedAt = DateTime.UtcNow
        };
 
        await _documents.AddAsync(document);
    }
 
    public async Task<ExpenseResponseDto> SubmitAsync(long expenseId, long currentUserId)
    {
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only submit your own expense.");
        }
 
        if (expense.Status != ExpenseStatus.Draft)
        {
            throw new ArgumentException("Only draft expenses can be submitted.");
        }
 
        var proofs = await _documents.GetByExpenseIdAsync(expenseId);
        if (proofs.Count == 0)
        {
            throw new ArgumentException("At least one proof document is required.");
        }
 
        var travel = await _travels.GetByIdAsync(expense.TravelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        ValidateExpenseSubmissionWindow(DateTime.UtcNow, travel);
 
 
        await ValidateAmountAsync(expense.CategoryId, expense.Amount);
 
        expense.Status = ExpenseStatus.Submitted;
        expense.SubmittedAt = DateTime.UtcNow;
 
        await _expenses.SaveAsync();
 
        var hrRoleId = await _roles.GetRoleIdByNameAsync("HR");
        if (hrRoleId.HasValue && hrRoleId.Value > 0)
        {
            var hrUsers = await _users.GetUsersByRoleIdAsync(hrRoleId.Value);
 
            var title = "Expense submitted";
            var message = $"Expense #{expense.ExpenseId} has been submitted for review.";
 
            await _notifications.CreateForUsersAsync(hrUsers.Select(u => u.UserId), title, message);
 
            // var hrMailbox = _emailSettings.Value.HrMailbox;
            // if (!string.IsNullOrWhiteSpace(hrMailbox))
            // {
            //     await _email.SendAsync(hrMailbox, title, message);
            // }
        }
 
        return Map(expense);
    }
 public async Task<ExpenseResponseDto> ReviewAsync(long expenseId, ExpenseReviewDto dto, long reviewerId)
    {
        if (dto.Status is not (ExpenseStatus.Approved or ExpenseStatus.Rejected))
        {
            throw new ArgumentException("Status must be Approved or Rejected.");
        }
 
        if (dto.Status == ExpenseStatus.Rejected && string.IsNullOrWhiteSpace(dto.Remarks))
        {
            throw new ArgumentException("Remarks are required when rejecting.");
        }
 
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.Status != ExpenseStatus.Submitted)
        {
            throw new ArgumentException("Only submitted expenses can be reviewed.");
        }
 
        var travel = await _travels.GetByIdAsync(expense.TravelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        if (travel.CreatedBy != reviewerId)
        {
            throw new ArgumentException("You can only review expenses for travels you created.");
        }
 
        if (expense.ReviewedAt.HasValue || expense.ReviewedBy.HasValue)
        {
            throw new ArgumentException("This expense has already been reviewed.");
        }
 
        expense.Status = dto.Status;
        expense.HrRemarks = dto.Remarks;
        expense.ReviewedBy = reviewerId;
        expense.ReviewedAt = DateTime.UtcNow;
 
        await _expenses.SaveAsync();

 
        return Map(expense);
    }
 
    public async Task<ExpenseResponseDto> UpdateDraftAsync(long expenseId, ExpenseUpdateDto dto, long currentUserId)
    {
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only update your own expenses.");
        }
 
        if (expense.Status != ExpenseStatus.Draft)
        {
            throw new ArgumentException("Only draft expenses can be updated.");
        }
 
        var travel = await _travels.GetByIdAsync(expense.TravelId);
        if (travel is null)
        {
            throw new ArgumentException("Travel not found.");
        }
 
        ValidateExpenseWindow(dto.ExpenseDate, travel);
        await ValidateAmountAsync(dto.CategoryId, dto.Amount);
 
        expense.CategoryId = dto.CategoryId;
        expense.Amount = dto.Amount;
        expense.Currency = dto.Currency;
        expense.ExpenseDate = dto.ExpenseDate;
        expense.UpdatedAt = DateTime.UtcNow;
 
        await _expenses.SaveAsync();
        return Map(expense);
    }
 
    public async Task DeleteDraftAsync(long expenseId, long currentUserId)
    {
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only delete your own expenses.");
        }
 
        if (expense.Status != ExpenseStatus.Draft)
        {
            throw new ArgumentException("Only draft expenses can be deleted.");
        }
 
        await _expenses.DeleteAsync(expense);
    }
 
    public async Task DeleteProofAsync(long expenseId, long proofId, long currentUserId)
    {
        var expense = await _expenses.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new ArgumentException("Expense not found.");
        }
 
        if (expense.EmployeeId != currentUserId)
        {
            throw new ArgumentException("You can only edit your own expenses.");
        }
 
        if (expense.Status != ExpenseStatus.Draft)
        {
            throw new ArgumentException("Proofs can only be removed for draft expenses.");
        }
 
        var proof = await _documents.GetByIdAsync(proofId);
        if (proof is null || proof.ExpenseId != expenseId)
        {
            throw new ArgumentException("Proof not found.");
        }
 
        await _documents.DeleteAsync(proof);
    }
 
    public async Task<IReadOnlyCollection<ExpenseResponseDto>> ListForEmployeeAsync(long employeeId)
    {
        var expenses = await _expenses.GetByAssigneeAsync(employeeId);
        return expenses.Select(Map).ToList();
    }
 
    public async Task<IReadOnlyCollection<ExpenseResponseDto>> ListForHrAsync(long? employeeId, long? travelId, DateTime? from, DateTime? to, string? status, long createdById)
    {
        var expenses = await _expenses.GetFilteredAsync(employeeId, travelId, from, to, status, createdById);
        return expenses.Select(Map).ToList();
    }
 
    private void ValidateExpenseWindow(DateTime expenseDate, Travel travel)
    {
        var lastAllowed = travel.EndDate.AddDays(10);
        if (expenseDate < travel.StartDate || expenseDate > lastAllowed)
        {
            throw new ArgumentException("Expense date is outside the submission window.");
        }
    }
 
    private void ValidateExpenseSubmissionWindow(DateTime submittedAt, Travel travel)
    {
        var lastAllowed = travel.EndDate.AddDays(10);
        if (submittedAt > lastAllowed)
        {
            throw new ArgumentException("Expense submission window has closed.");
        }
    }
 
    private async Task ValidateAmountAsync(long categoryId, decimal amount)
    {
        var maxPerDay = await _categories.GetMaxAmountPerDayAsync(categoryId);
 
        if (maxPerDay <= 0)
        {
            return;
        }
 
        if (amount > maxPerDay)
        {
            throw new ArgumentException("Amount exceeds the allowed maximum per day.");
        }
    }
 
    private static ExpenseResponseDto Map(Expense expense)
    {
        var proofs = expense.ProofDocuments
            .OrderBy(p => p.UploadedAt)
            .Select(p => new ExpenseProofDto(
                p.ProofId,
                p.FileName ?? string.Empty,
                p.FilePath ?? string.Empty,
                p.FileType?.ToString(),
                p.UploadedAt))
            .ToList();
 
        return new ExpenseResponseDto(
            expense.ExpenseId,
            // expense.AssignId,
            expense.EmployeeId,
            expense.CategoryId,
            expense.Amount,
            expense.Currency,
            expense.ExpenseDate,
            expense.Status,
            expense.SubmittedAt,
            expense.ReviewedBy,
            expense.ReviewedAt,
            expense.HrRemarks,
            proofs);
    }
}
 