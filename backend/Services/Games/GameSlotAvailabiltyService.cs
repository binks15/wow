using backend.Entities.Games;

namespace backend.Services.Games;

/// <summary>
/// Updates a slot status to open or locked based on current time.
/// </summary>
public static class GameSlotAvailabilityService
{
    /// <summary>
    /// Updates slot status between open and locked based on current time, and ignores booked or cancelled slots.
    /// </summary>
    public static bool UpdateSlotAvailability(GameSlot slot, DateTime localNow)
    {
        if (slot.Status == GameSlotStatus.Booked || slot.Status == GameSlotStatus.Cancelled)
        {
            return false;
        }

        var shouldLock = slot.StartTime <= localNow;
        if (shouldLock && slot.Status == GameSlotStatus.Open)
        {
            slot.Status = GameSlotStatus.Locked;
            slot.UpdatedAt = localNow;
            return true;
        }

        if (!shouldLock && slot.Status == GameSlotStatus.Locked)
        {
            slot.Status = GameSlotStatus.Open;
            slot.UpdatedAt = localNow;
            return true;
        }

        return false;
    }
}