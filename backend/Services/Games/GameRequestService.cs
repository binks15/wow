using backend.DTO.Common;
using backend.DTO.Games;
using backend.Entities.Games;
using backend.Repositories.Games;

namespace backend.Services.Games;

public class GameRequestService 
{
    private readonly IGameRequestRepository _repository;
    private readonly GameAllocationService _allocationService;
    private readonly GameBookingService _bookingService;

    public GameRequestService(
        IGameRequestRepository repository,
        GameAllocationService allocationService,
        GameBookingService bookingService)
    {
        _repository = repository;
        _allocationService = allocationService;
        _bookingService = bookingService;
    }

    // it first check all validation and then add slot request.if request is for immediate slot then it booked immediately
    public async Task<GameSlotRequestDto> RequestSlotAsync(long gameId, long slotId, long requesterId, IReadOnlyCollection<long> participantIds)
    {
        var slot = await _repository.GetSlotWithGameAsync(gameId, slotId);

        if (slot is null || slot.Game is null)
        {
            throw new ArgumentException("Slot not found.");
        }

        if (slot.Status != GameSlotStatus.Open)
        {
            throw new ArgumentException("Slot is not available.");
        }

        var now = DateTime.Now;
        if (slot.StartTime < now)
        {
            throw new ArgumentException("Slot has already started.");
        }

        var immediateWindowEnd = now.AddMinutes(60);
        var isImmediateWindow = slot.StartTime <= immediateWindowEnd;

        var distinctParticipants = participantIds.Distinct().Where(id => id != requesterId).ToList();
        if (distinctParticipants.Count > 3)
        {
            throw new ArgumentException("You can add at most 3 other employees.");
        }

        var totalPlayers = 1 + distinctParticipants.Count;
        if (totalPlayers > slot.Game.MaxPlayersPerSlot)
        {
            throw new ArgumentException("Requested participants exceed the slot capacity.");
        }

        var requestUserIds = distinctParticipants.Append(requesterId).ToList();
        var interestedCount = await _repository.CountInterestedUsersAsync(gameId, requestUserIds);

        if (interestedCount != requestUserIds.Count)
        {
            throw new ArgumentException("All participants must be interested in this game.");
        }

        var bookingDate = slot.StartTime.Date;

        // validation if we want to restrict employee to play only one game per day.

        // var hasBooking = await _repository.HasBookingForDateAsync(requestUserIds, bookingDate);
        // if (hasBooking)
        // {
        //     throw new ArgumentException("One or more participants already have a booking for this day.");
        // }

        var hasActiveRequest = await _repository.HasActiveRequestForDateAsync(requestUserIds, bookingDate);
        if (hasActiveRequest)
        {
            throw new ArgumentException("One or more participants already have a pending request for this day.");
        }

        var request = new GameSlotRequest
        {
            SlotId = slotId,
            RequestedBy = requesterId,
            Status = GameSlotRequestStatus.Pending,
            RequestedAt = now,
            UpdatedAt = now
        };

        foreach (var participantId in distinctParticipants)
        {
            request.Participants.Add(new GameSlotRequestParticipant
            {
                UserId = participantId
            });
        }

        await _repository.AddSlotRequestAsync(request);

        if (isImmediateWindow)
        {
            await _allocationService.AllocatePendingForSlotAsync(slot, now);
            await _repository.SaveAsync();
        }

        return new GameSlotRequestDto(
            request.RequestId,
            request.SlotId,
            request.RequestedBy,
            request.Status,
            request.RequestedAt,
            distinctParticipants
        );
    }

    // cancel requests and if request is already been booked then cancels booking also.
    public async Task CancelRequestAsync(long requestId, long requesterId)
    {
        var request = await _repository.GetSlotRequestByIdAsync(requestId);

        if (request is null)
        {
            throw new ArgumentException("Request not found.");
        }

        if (request.RequestedBy != requesterId)
        {
            throw new ArgumentException("You can only cancel your own requests.");
        }

        if (request.Status == GameSlotRequestStatus.Cancelled || request.Status == GameSlotRequestStatus.Rejected)
        {
            return;
        }

        if (request.Status == GameSlotRequestStatus.Assigned)
        {
            await _bookingService.CancelBookingBySlotAsync(request.SlotId, requesterId);
        }

        request.Status = GameSlotRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;
        await _repository.SaveAsync();
    }

    // return user's requests in a given date rannge
    public async Task<IReadOnlyCollection<GameSlotRequestSummaryDto>> GetMyRequestsAsync(long userId, DateTime from, DateTime to)
    {
        var requests = await _repository.GetActiveRequestsForUserAsync(userId, from, to);
        if (requests.Count == 0)
        {
            return Array.Empty<GameSlotRequestSummaryDto>();
        }

        var participantIds = requests
            .SelectMany(r => r.Participants.Select(p => p.UserId).Append(r.RequestedBy))
            .Distinct()
            .ToList();

        var users = await _repository.GetEmployeeLookupByIdsAsync(participantIds);
        var userLookup = users.ToDictionary(u => u.Id, u => u);

        return requests
            .Where(r => r.Slot is not null)
            .Select(r =>
            {
                var slot = r.Slot!;
                var gameName = slot.Game?.GameName ?? string.Empty;
                var participantList = r.Participants
                    .Select(p => userLookup.TryGetValue(p.UserId, out var user)
                        ? user
                        : new EmployeeLookupDto(p.UserId, string.Empty, string.Empty))
                    .ToList();

                if (userLookup.TryGetValue(r.RequestedBy, out var requester) && participantList.All(p => p.Id != requester.Id))
                {
                    participantList.Add(requester);
                }

                return new GameSlotRequestSummaryDto(
                    r.RequestId,
                    slot.GameId,
                    gameName,
                    slot.SlotId,
                    slot.StartTime,
                    slot.EndTime,
                    r.Status,
                    r.RequestedAt,
                    r.RequestedBy,
                    participantList
                );
            })
            .OrderBy(r => r.StartTime)
            .ToList();
    }
}