using backend.Data;
using backend.Entities.Travels;
using Microsoft.EntityFrameworkCore;
 
namespace backend.Repositories.Travels;
 
public class ExpenseProofRepository : IExpenseProofRepository
{
    private readonly AppDbContext _db;
 
    public ExpenseProofRepository(AppDbContext db)
    {
        _db = db;
    }
 
    public async Task<ExpenseProof> AddAsync(ExpenseProof document)
    {
        _db.ExpenseDocuments.Add(document);
        await _db.SaveChangesAsync();
        return document;
    }
 
    public async Task<IReadOnlyCollection<ExpenseProof>> GetByExpenseIdAsync(long expenseId)
    {
        return await _db.ExpenseDocuments
            .Where(d => d.ExpenseId == expenseId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }
 
    public async Task<ExpenseProof?> GetByIdAsync(long proofId)
    {
        return await _db.ExpenseDocuments.FirstOrDefaultAsync(d => d.ProofId == proofId);
    }
 
    public async Task DeleteAsync(ExpenseProof document)
    {
        _db.ExpenseDocuments.Remove(document);
        await _db.SaveChangesAsync();
    }
}
 