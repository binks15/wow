using backend.Entities.Travels;
namespace backend.Repositories.Travels;
 
public interface IExpenseProofRepository
{
  Task<ExpenseProof> AddAsync(ExpenseProof document);
  Task<IReadOnlyCollection<ExpenseProof>> GetByExpenseIdAsync(long expenseId);
  Task<ExpenseProof?> GetByIdAsync(long proofId);
  Task DeleteAsync(ExpenseProof document);
}
 