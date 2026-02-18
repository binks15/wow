namespace backend.Services.Games;

/// <summary>
/// Runs every minute to allocate upcoming game slots in the background.
/// </summary>
public class GameSlotBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GameSlotBackgroundService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    /// <summary>
    /// Initializes background service dependencies used to resolve scoped services and log failures.
    /// </summary>
    public GameSlotBackgroundService(IServiceScopeFactory scopeFactory, ILogger<GameSlotBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    /// <summary>
    /// Runs continuously on a fixed interval to allocate upcoming slots and logs any execution errors.
    /// </summary>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scheduler = scope.ServiceProvider.GetRequiredService<GameAllocationService>();
                await scheduler.AllocateSlotsAsync(DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to allocate game slots.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}