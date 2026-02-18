using backend.Entities.Games;

namespace backend.Services.Games;

public static class GameSlotAvailabilityService
{
    // checking condition for changing status of slot based on time 
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