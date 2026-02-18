using backend.Entities.Common;
using backend.Entities.Games;
using backend.Entities.Referrals;
using backend.Entities.Travels;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class ModelBuilderExtensions
{
    public static ModelBuilder ConfigureAppModels(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Manager)
            .WithMany(u => u.DirectReports)
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Travel>()
            .HasOne(t => t.Creator)
            .WithMany(u => u.TravelsCreated)
            .HasForeignKey(t => t.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TravelAssignment>()
            .HasOne(a => a.Travel)
            .WithMany(t => t.Assignments)
            .HasForeignKey(a => a.TravelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TravelAssignment>()
            .HasOne(a => a.Employee)
            .WithMany(u => u.TravelAssignments)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TravelDocument>()
            .HasOne(d => d.Travel)
            .WithMany(t => t.Documents)
            .HasForeignKey(d => d.TravelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TravelDocument>()
            .HasOne(d => d.Employee)
            .WithMany()
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<TravelDocument>()
            .HasOne(d => d.Uploader)
            .WithMany(u => u.TravelDocumentsUploaded)
            .HasForeignKey(d => d.UploadedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TravelDocument>().Property(d => d.OwnerType)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Travel)
            .WithMany(a => a.Expenses)
            .HasForeignKey(e => e.TravelId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Reviewer)
            .WithMany(u => u.ExpensesReviewed)
            .HasForeignKey(e => e.ReviewedBy)
            .OnDelete(DeleteBehavior.Restrict);

        //added enum to string
          modelBuilder.Entity<Expense>().Property(g => g.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<ExpenseProof>()
            .HasOne(d => d.Expense)
            .WithMany(e => e.ProofDocuments)
            .HasForeignKey(d => d.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);

            //added enum to string
          modelBuilder.Entity<ExpenseProof>().Property(g => g.FileType)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<UserRefreshToken>()
            .HasOne(t => t.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserRefreshToken>()
            .HasIndex(t => t.TokenHash)
            .IsUnique();

        modelBuilder.Entity<Notification>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Game>()
            .HasIndex(g => g.GameName)
            .IsUnique();

        modelBuilder.Entity<GameSlot>()
            .HasOne(s => s.Game)
            .WithMany(g => g.Slots)
            .HasForeignKey(s => s.GameId)
            .OnDelete(DeleteBehavior.Cascade);
        
        //added enum to string
          modelBuilder.Entity<GameSlot>().Property(g => g.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<GameSlotRequest>()
            .HasOne(r => r.Slot)
            .WithMany(s => s.Requests)
            .HasForeignKey(r => r.SlotId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GameSlotRequest>()
            .HasOne(r => r.Requester)
            .WithMany()
            .HasForeignKey(r => r.RequestedBy)
            .OnDelete(DeleteBehavior.Restrict);

            //added enum to string
          modelBuilder.Entity<GameSlotRequest>().Property(g => g.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<GameSlotRequestParticipant>()
            .HasOne(p => p.Request)
            .WithMany(r => r.Participants)
            .HasForeignKey(p => p.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GameSlotRequestParticipant>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GameBooking>()
            .HasOne(b => b.Game)
            .WithMany(g => g.Bookings)
            .HasForeignKey(b => b.GameId)
            .OnDelete(DeleteBehavior.Restrict);

//added enum to string
          modelBuilder.Entity<GameBooking>().Property(g => g.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<GameBooking>()
            .HasOne(b => b.Slot)
            .WithMany(s => s.Bookings)
            .HasForeignKey(b => b.SlotId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GameBooking>()
            .HasOne(b => b.Creator)
            .WithMany()
            .HasForeignKey(b => b.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GameBookingParticipant>()
            .HasOne(p => p.Booking)
            .WithMany(b => b.Participants)
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GameBookingParticipant>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserGameInterest>()
            .HasIndex(i => new { i.UserId, i.GameId })
            .IsUnique();

        modelBuilder.Entity<GameHistory>()
            .HasIndex(h => new { h.UserId, h.GameId, h.CycleStartDate, h.CycleEndDate })
            .IsUnique();

      
        return modelBuilder;
    }
}