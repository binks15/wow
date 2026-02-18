using backend.DTO.Common;
using backend.DTO.Games;
using backend.Entities.Games;
using backend.Repositories.Games;

namespace backend.Services.Games;

public class GameSlotService 
{
    private readonly IGameSlotRepository _repository;

    public GameSlotService(IGameSlotRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<GameSlotDto>> GenerateSlotsAsync(long gameId, DateTime startDate, DateTime endDate)
    {
        var game = await _repository.GetGameByIdAsync(gameId);
        if (game is null)
        {
            throw new ArgumentException("Game not found.");
        }

        var start = startDate.Date;
        var end = endDate.Date;
        if (end < start)
        {
            throw new ArgumentException("End date must be on or after start date.");
        }

        var duration = TimeSpan.FromMinutes(game.SlotDurationMinutes);
        if (duration <= TimeSpan.Zero)
        {
            throw new ArgumentException("Slot duration must be greater than 0.");
        }

        var rangeEnd = end.AddDays(1);
        var existingStarts = await _repository.GetSlotStartTimesAsync(gameId, start, rangeEnd);

        var existingStartSet = new HashSet<DateTime>(existingStarts);
        var newSlots = new List<GameSlot>();

        for (var day = start; day <= end; day = day.AddDays(1))
        {
            var dayStart = day.Add(game.OperatingHoursStart);
            var dayEnd = day.Add(game.OperatingHoursEnd);
            if (dayEnd <= dayStart)
            {
                dayEnd = dayStart.AddDays(1);
            }

            for (var slotStart = dayStart; slotStart.Add(duration) <= dayEnd; slotStart = slotStart.Add(duration))
            {
                if (existingStartSet.Contains(slotStart))
                {
                    continue;
                }

                newSlots.Add(new GameSlot
                {
                    GameId = gameId,
                    StartTime = slotStart,
                    EndTime = slotStart.Add(duration),
                    Status = GameSlotStatus.Open
                });
            }
        }

        if (newSlots.Count > 0)
        {
            await _repository.AddSlotsAsync(newSlots);
        }

        var slots = await _repository.GetSlotsInRangeAsync(gameId, start, rangeEnd);
        return slots.Select(s => new GameSlotDto(s.SlotId, s.GameId, s.StartTime, s.EndTime, s.Status)).ToList();
    }

    public async Task<IReadOnlyCollection<GameSlotDto>> GetSlotsForDateAsync(long gameId, DateTime date)
    {
        var slots = await _repository.GetSlotsForDateAsync(gameId, date);
        var localNow =DateTime.UtcNow;
        var shouldSave = false;

        foreach (var slot in slots)
        {
            shouldSave |= GameSlotAvailabilityService.UpdateSlotAvailability(slot, localNow);
        }

        if (shouldSave)
        {
            await _repository.SaveAsync();
        }

        return slots.Select(s => new GameSlotDto(s.SlotId, s.GameId, s.StartTime, s.EndTime, s.Status)).ToList();
    }

    public async Task<IReadOnlyCollection<GameSlotSummaryDto>> GetUpcomingSlotsAsync(long gameId, DateTime fromUtc, DateTime toUtc)
    {
        var slots = await _repository.GetSlotsInRangeAsync(gameId, fromUtc, toUtc);

        if (slots.Count == 0)
        {
            return Array.Empty<GameSlotSummaryDto>();
        }

        var localNow = DateTime.UtcNow;
        var shouldSave = false;
        foreach (var slot in slots)
        {
            shouldSave |= GameSlotAvailabilityService.UpdateSlotAvailability(slot, localNow);
        }

        if (shouldSave)
        {
            await _repository.SaveAsync();
        }

        var slotIds = slots.Select(s => s.SlotId).ToList();
        var bookings = await _repository.GetBookingsWithParticipantsBySlotIdsAsync(slotIds);

        var bookingUserIds = bookings
            .SelectMany(b => b.Participants.Select(p => p.UserId))
            .Distinct()
            .ToList();

        var users = await _repository.GetEmployeeLookupByIdsAsync(bookingUserIds);
        var userLookup = users.ToDictionary(u => u.Id, u => u);

        var participantsLookup = bookings
            .ToDictionary(
                b => b.BookingId,
                b => (IReadOnlyCollection<EmployeeLookupDto>)b.Participants
                    .Select(p => userLookup.TryGetValue(p.UserId, out var user) ? user : new EmployeeLookupDto(p.UserId, string.Empty, string.Empty))
                    .ToList());

        var slotParticipants = bookings
            .GroupBy(b => b.SlotId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyCollection<EmployeeLookupDto>)g
                    .SelectMany(b => participantsLookup.TryGetValue(b.BookingId, out var list) ? list : Array.Empty<EmployeeLookupDto>())
                    .ToList());

        return slots.Select(slot => new GameSlotSummaryDto(
            slot.SlotId,
            slot.GameId,
            slot.StartTime,
            slot.EndTime,
            slot.Status,
            slotParticipants.TryGetValue(slot.SlotId, out var list) ? list : Array.Empty<EmployeeLookupDto>()))
            .ToList();
    }
}