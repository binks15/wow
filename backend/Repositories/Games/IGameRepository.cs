using backend.Entities.Games;

namespace backend.Repositories.Games;

public interface IGameRepository
{
    Task<IReadOnlyCollection<Game>> GetAllAsync();
    Task<Game?> GetByIdAsync(long gameId);
    Task<IReadOnlyCollection<Game>> GetByIdsAsync(IReadOnlyCollection<long> gameIds);
    Task AddAsync(Game game);
    Task<IReadOnlyCollection<UserGameInterest>> GetInterestsByUserAsync(long userId);
    Task AddInterestsAsync(IEnumerable<UserGameInterest> interests);
    Task SaveAsync();
}