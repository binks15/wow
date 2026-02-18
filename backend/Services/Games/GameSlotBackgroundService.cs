namespace backend.Services.Games;

public class GameSlotBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GameSlotBackgroundService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    public GameSlotBackgroundService(IServiceScopeFactory scopeFactory, ILogger<GameSlotBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var scheduler = scope.ServiceProvider.GetRequiredService<GameAllocationService>();
                await scheduler.AllocateSlotsAsync(DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to allocate game slots.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}