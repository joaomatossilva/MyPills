using Microsoft.EntityFrameworkCore;

namespace MyPills.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Medicine> Medicines { get; set; }
    public DbSet<StockEntry> StockEntries { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<PrescribedMedicine> PrescribedMedicine { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<ProfileShare> ProfileShares { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Medicine>()
            .Property(x => x.DailyConsumption)
            .HasDefaultValue(1);

        modelBuilder.Entity<ApplicationUser>()
            .Property(x => x.ShareCode)
            .HasMaxLength(6)
            .IsUnicode(false)
            .UseCollation("Latin1_General_100_BIN2");

        modelBuilder.Entity<ApplicationUser>()
            .HasIndex(x => x.ShareCode)
            .IsUnique();

        modelBuilder.Entity<Profile>()
            .HasIndex(x => new { x.OwnerId, x.IsDefault })
            .HasFilter("[IsDefault] = 1")
            .IsUnique();

        modelBuilder.Entity<Profile>()
            .HasOne(x => x.Owner)
            .WithMany(x => x.OwnedProfiles)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProfileShare>()
            .HasOne(x => x.Profile)
            .WithMany(x => x.Shares)
            .HasForeignKey(x => x.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProfileShare>()
            .HasOne(x => x.SharedWithUser)
            .WithMany(x => x.SharedProfiles)
            .HasForeignKey(x => x.SharedWithUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Medicine>()
            .HasOne(x => x.Profile)
            .WithMany(x => x.Medicines)
            .HasForeignKey(x => x.ProfileId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Prescription>()
            .HasOne(x => x.Profile)
            .WithMany(x => x.Prescriptions)
            .HasForeignKey(x => x.ProfileId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<StockEntry>()
            .HasOne(x => x.Profile)
            .WithMany(x => x.StockEntries)
            .HasForeignKey(x => x.ProfileId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
