using backend.Entities.Games;

namespace backend.Services.Games;

public static class GameSlotAvailabilityService
{
    // updates slot status between open and locked based on current time
    public static bool UpdateSlotAvailability(GameSlot slot, DateTime localNow)
    {
        if (slot.Status == GameSlotStatus.Booked || slot.Status == GameSlotStatus.Cancelled)
        {
            return false;
        }

        var shouldLock = slot.StartTime <= localNow.AddMinutes(1);
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