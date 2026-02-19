using backend.DTO.Games;
using backend.Entities.Games;
using backend.Repositories.Games;

namespace backend.Services.Games;

public class GameService
{
    private readonly IGameRepository _repository;

    public GameService(IGameRepository repository)
    {
        _repository = repository;
    }

    // return all games detail 
    public async Task<IReadOnlyCollection<GameDto>> GetAllAsync()
    {
        var games = await _repository.GetAllAsync();
        return games.Select(MapGame).ToList();
    }

    // return game by id
    public async Task<GameDto> GetByIdAsync(long gameId)
    {
        var game = await _repository.GetByIdAsync(gameId);
        if (game is null)
        {
            throw new ArgumentException("Game not found.");
        }

        return MapGame(game);
    }

    // create a new game
    public async Task<GameDto> CreateAsync(GameCreateDto dto)
    {
        ValidateGame(dto.GameName, dto.OperatingHoursStart, dto.OperatingHoursEnd, dto.SlotDurationMinutes, dto.MaxPlayersPerSlot);

        var game = new Game
        {
            GameName = dto.GameName.Trim(),
            OperatingHoursStart = dto.OperatingHoursStart,
            OperatingHoursEnd = dto.OperatingHoursEnd,
            SlotDurationMinutes = dto.SlotDurationMinutes,
            MaxPlayersPerSlot = dto.MaxPlayersPerSlot,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(game);
        return MapGame(game);
    }

    // update game
    public async Task<GameDto> UpdateAsync(long gameId, GameUpdateDto dto)
    {

        var game = await _repository.GetByIdAsync(gameId);
        if (game is null)
        {
            throw new ArgumentException("Game not found.");
        }
        if (dto.GameName is not null)
        {
            game.GameName = dto.GameName.Trim();
        }
        if (dto.OperatingHoursStart is not null)
        {
            game.OperatingHoursStart = dto.OperatingHoursStart ?? game.OperatingHoursStart;
        }
        if (dto.OperatingHoursEnd is not null)
        {
            game.OperatingHoursEnd = dto.OperatingHoursEnd ?? game.OperatingHoursEnd;
        }
        if (dto.SlotDurationMinutes is not null)
        {
            game.SlotDurationMinutes = dto.SlotDurationMinutes ?? game.SlotDurationMinutes;
        }
        if (dto.MaxPlayersPerSlot is not null)
        {
            game.MaxPlayersPerSlot = dto.MaxPlayersPerSlot ?? game.MaxPlayersPerSlot;
        }
        game.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();
        return MapGame(game);
    }

    // return user's games interest
    public async Task<IReadOnlyCollection<GameInterestDto>> GetUserInterestsAsync(long userId)
    {
        var games = await _repository.GetAllAsync();
        var interests = await _repository.GetInterestsByUserAsync(userId);
        var interestLookup = interests.ToDictionary(i => i.GameId, i => i.IsInterested);

        return games.Select(game => new GameInterestDto(
            game.GameId,
            game.GameName ?? string.Empty,
            interestLookup.TryGetValue(game.GameId, out var isInterested) && isInterested
        )).ToList();
    }

    // update or create a interest for a game
    public async Task<IReadOnlyCollection<GameInterestDto>> UpdateUserInterestsAsync(long userId, IReadOnlyCollection<long> gameIds)
    {
        var distinctIds = gameIds.Distinct().ToList();
        var games = await _repository.GetByIdsAsync(distinctIds);

        if (games.Count != distinctIds.Count)
        {
            throw new ArgumentException("One or more games were not found.");
        }

        var existing = await _repository.GetInterestsByUserAsync(userId);
        var existingLookup = existing.ToDictionary(i => i.GameId);
        var newInterests = new List<UserGameInterest>();

        foreach (var game in games)
        {
            if (existingLookup.TryGetValue(game.GameId, out var interest))
            {
                interest.IsInterested = !interest.IsInterested;
                interest.RegisteredAt = DateTime.UtcNow;
            }
            else
            {
                newInterests.Add(new UserGameInterest
                {
                    UserId = userId,
                    GameId = game.GameId,
                    IsInterested = true,
                    RegisteredAt = DateTime.UtcNow
                });
            }
        }

        foreach (var interest in existing)
        {
            if (!distinctIds.Contains(interest.GameId))
            {
                interest.IsInterested = false;
            }
        }

        if (newInterests.Count > 0)
        {
            await _repository.AddInterestsAsync(newInterests);
        }

        await _repository.SaveAsync();
        return await GetUserInterestsAsync(userId);
    }

    // validations for a game
    private static void ValidateGame(string name, TimeSpan start, TimeSpan end, int slotDurationMinutes, int maxPlayersPerSlot)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Game name is required.");
        }

        if (slotDurationMinutes <= 0)
        {
            throw new ArgumentException("Slot duration must be greater than 0.");
        }

        if (maxPlayersPerSlot <= 0)
        {
            throw new ArgumentException("Max players per slot must be greater than 0.");
        }

        if (end == start)
        {
            throw new ArgumentException("Operating hours start and end cannot be the same.");
        }
    }

    private static GameDto MapGame(Game game)
    {
        return new GameDto(
            game.GameId,
            game.GameName ?? string.Empty,
            game.OperatingHoursStart,
            game.OperatingHoursEnd,
            game.SlotDurationMinutes,
            game.MaxPlayersPerSlot
        );
    }
}