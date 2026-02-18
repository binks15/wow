using backend.DTO.Games;
using backend.Entities.Games;
using backend.Repositories.Games;
using backend.Services.Common;

namespace backend.Services.Games;

public class GameAllocationService
{
    private readonly IGameAllocationRepository _repository;
    private readonly NotificationService _notifications;
    private readonly EmailService _email;

    public GameAllocationService(
        IGameAllocationRepository repository,
        NotificationService notifications,
        EmailService email
        )
    {
        _repository = repository;
        _notifications = notifications;
        _email = email;
    }

    //for background job - change status of immediate(after 1 hour) slot to pending 
    public async Task AllocateSlotsAsync(DateTime localNow)
    {
        var windowStart = localNow.AddMinutes(55);
        var windowEnd = localNow.AddMinutes(60);

        var slots = await _repository.GetSlotsForAllocationWindowAsync(windowStart, windowEnd);

        foreach (var slot in slots)
        {
            await AllocateSlotAsync(slot, localNow, GameSlotRequestStatus.Pending);
        }

        if (slots.Count > 0)
        {
            await _repository.SaveAsync();
        }
    }

    // for requesting in immediate slot
    public async Task AllocatePendingForSlotAsync(GameSlot slot, DateTime localNow)
    {
        await AllocateSlotAsync(slot, localNow, GameSlotRequestStatus.Pending);
    }

    // for running booking allocation logic on waitlist slot
    public async Task FillSlotFromWaitlistAsync(GameSlot slot)
    {
        var localNow = DateTime.UtcNow;
        await AllocateSlotAsync(slot, localNow, GameSlotRequestStatus.Waitlisted);
    }

    // logic for what to do after allocation of slot like add entry in booking table and add booking participants
    private async Task AllocateSlotAsync(GameSlot slot, DateTime localNow, GameSlotRequestStatus sourceStatus)
    {
        if (slot.Game is null)
        {
            slot.Game = await _repository.GetGameByIdAsync(slot.GameId);
        }

        var requests = await _repository.GetSlotRequestsByStatusAsync(slot.SlotId, sourceStatus);

        if (requests.Count == 0)
        {
            GameSlotAvailabilityService.UpdateSlotAvailability(slot, localNow);
            return;
        }

        var allocation = await BuildAllocationAsync(slot, requests);

        if (allocation.AssignedUserIds.Count == 0)
        {
            GameSlotAvailabilityService.UpdateSlotAvailability(slot, localNow);
            return;
        }

        var createdBy = allocation.RequestedBy == 0 ? allocation.AssignedUserIds.First() : allocation.RequestedBy;

        var booking = new GameBooking
        {
            GameId = slot.GameId,
            SlotId = slot.SlotId,
            BookingDate = slot.StartTime.Date,
            SlotStartTime = slot.StartTime.TimeOfDay,
            SlotEndTime = slot.EndTime.TimeOfDay,
            Status = BookingStatus.Booked,
            CreatedBy = createdBy
        };

        foreach (var userId in allocation.AssignedUserIds)
        {
            booking.Participants.Add(new GameBookingParticipant
            {
                UserId = userId
            });
        }

        await _repository.AddGameBookingAsync(booking);
        await UpdateHistoryAsync(slot, allocation.CycleStart, allocation.AssignedUserIds);

        foreach (var request in allocation.AssignedRequests)
        {
            request.Status = GameSlotRequestStatus.Assigned;
            request.UpdatedAt = localNow;
        }

        if (sourceStatus == GameSlotRequestStatus.Pending)
        {
            foreach (var request in allocation.WaitlistedRequests)
            {
                request.Status = GameSlotRequestStatus.Waitlisted;
                request.UpdatedAt = localNow;
            }
        }

        slot.Status = GameSlotStatus.Booked;
        slot.UpdatedAt = localNow;

        await NotifyAllocationAsync(slot, allocation.AssignedUserIds);
    }

    // main logic behind slot allocation - check requests->check cycle->give rank->return result
    private async Task<AllocationResult> BuildAllocationAsync(GameSlot slot, IReadOnlyCollection<GameSlotRequest> requests)
    {
        var requestUserSets = requests.Select(r => new
        {
            Request = r,
            UserIds = r.Participants.Select(p => p.UserId).Append(r.RequestedBy).Distinct().ToList()
        }).ToList();

        var allUserIds = requestUserSets.SelectMany(r => r.UserIds).Distinct().ToList();
        var interestedUserIds = await _repository.GetInterestedUserIdsAsync(slot.GameId);
        if (interestedUserIds.Count == 0)
        {
            interestedUserIds = allUserIds;
        }

        var (cycleStart, cycleEnd) = await _repository.GetLatestCycleAsync(slot.GameId);
        if (!cycleStart.HasValue || (cycleEnd.HasValue && cycleEnd.Value < slot.StartTime))
        {
            cycleStart = slot.StartTime;
        }

        var histories = await _repository.GetGameHistoriesAsync(slot.GameId, cycleStart!.Value, interestedUserIds);
        var historyLookup = histories.ToDictionary(h => h.UserId, h => h.SlotsPlayed);

        var cycleComplete = interestedUserIds.Count > 0 && interestedUserIds.All(userId =>
            historyLookup.TryGetValue(userId, out var slotsPlayed) && slotsPlayed > 0);

        if (cycleComplete)
        {
            await _repository.CloseCycleAsync(slot.GameId, cycleStart.Value, slot.StartTime);
            cycleStart = slot.StartTime;
            historyLookup = new Dictionary<long, int>();
        }

        var bookingDate = slot.StartTime.Date;
        var alreadyBookedUsers = (await _repository.GetBookedUserIdsForDateAsync(allUserIds, bookingDate)).ToHashSet();

        var sorted = requestUserSets
            .Select(r => new
            {
                r.Request,
                r.UserIds,
                Score = historyLookup.TryGetValue(r.Request.RequestedBy, out var count) ? count : 0
            })
            .OrderBy(r => r.Score)
            .ThenBy(r => r.Request.RequestedAt)
            .ToList();

        var assignedUserIds = new List<long>();
        var assignedRequests = new List<GameSlotRequest>();
        var waitlistedRequests = new List<GameSlotRequest>();
        var capacity = slot.Game?.MaxPlayersPerSlot ?? 0;

        var chosen = sorted.FirstOrDefault(entry =>
            entry.UserIds.Count <= capacity &&
            !entry.UserIds.Any(id => alreadyBookedUsers.Contains(id)));

        if (chosen is not null)
        {
            assignedUserIds.AddRange(chosen.UserIds);
            assignedRequests.Add(chosen.Request);
            waitlistedRequests.AddRange(requests.Where(r => r.RequestId != chosen.Request.RequestId));
        }

        return new AllocationResult(
            assignedUserIds,
            assignedRequests,
            waitlistedRequests,
            assignedRequests.FirstOrDefault()?.RequestedBy ?? 0,
            cycleStart!.Value
        );
    }

    // for adding data in game history table
    private async Task UpdateHistoryAsync(GameSlot slot, DateTime cycleStart, IReadOnlyCollection<long> userIds)
    {
        var cycleEnd = DateTime.MaxValue;
        var histories = await _repository.GetGameHistoriesAsync(slot.GameId, cycleStart, userIds);

        var historyLookup = histories.ToDictionary(h => h.UserId);
        var newHistories = new List<GameHistory>();

        foreach (var userId in userIds)
        {
            if (historyLookup.TryGetValue(userId, out var history))
            {
                history.SlotsPlayed += 1;
                history.LastPlayedDate = slot.StartTime;
            }
            else
            {
                newHistories.Add(new GameHistory
                {
                    UserId = userId,
                    GameId = slot.GameId,
                    CycleStartDate = cycleStart,
                    CycleEndDate = cycleEnd,
                    SlotsPlayed = 1,
                    LastPlayedDate = slot.StartTime
                });
            }
        }

        if (newHistories.Count > 0)
        {
            await _repository.AddGameHistoriesAsync(newHistories);
        }
    }

    // for in app notification and email notification
    private async Task NotifyAllocationAsync(GameSlot slot, IReadOnlyCollection<long> userIds)
    {
        if (userIds.Count == 0)
        {
            return;
        }

        var users = await _repository.GetEmployeeLookupByIdsAsync(userIds);
        var emails = users.Select(u => u.Email).Where(email => !string.IsNullOrWhiteSpace(email)).ToList();

        var title = "Game slot confirmed";
        var gameName = slot.Game?.GameName ?? "your game";
        var message = $"Your slot for {gameName} is confirmed at {slot.StartTime:u}.";


        await _notifications.CreateForUsersAsync(users.Select(u => u.Id), title, message);

        foreach (var user in users)
        {
            await _email.SendAsync(user.Email, title, message);
        }
    }


}