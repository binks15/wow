using backend.Data;
using backend.Entities.Games;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Games;

public class GameRepository : IGameRepository
{
    private readonly AppDbContext _db;

    public GameRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<Game>> GetAllAsync()
    {
        return await _db.Games
            .OrderBy(g => g.GameName)
            .ToListAsync();
    }

    public async Task<Game?> GetByIdAsync(long gameId)
    {
        return await _db.Games.FirstOrDefaultAsync(g => g.GameId == gameId);
    }

    public async Task<IReadOnlyCollection<Game>> GetByIdsAsync(IReadOnlyCollection<long> gameIds)
    {
        if (gameIds.Count == 0)
        {
            return Array.Empty<Game>();
        }

        return await _db.Games
            .Where(g => gameIds.Contains(g.GameId))
            .ToListAsync();
    }

    public async Task AddAsync(Game game)
    {
        _db.Games.Add(game);
        await _db.SaveChangesAsync();
    }

    public async Task<IReadOnlyCollection<UserGameInterest>> GetInterestsByUserAsync(long userId)
    {
        return await _db.UserGameInterests
            .Where(i => i.UserId == userId)
            .ToListAsync();
    }

    public async Task AddInterestsAsync(IEnumerable<UserGameInterest> interests)
    {
        _db.UserGameInterests.AddRange(interests);
        await _db.SaveChangesAsync();
    }

    public async Task SaveAsync()
    {
        await _db.SaveChangesAsync();
    }
}