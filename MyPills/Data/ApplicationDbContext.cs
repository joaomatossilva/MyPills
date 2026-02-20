using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MyPills.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IContextUser contextUser)
    : IdentityDbContext(options)
{
    public DbSet<Medicine> Medicines { get; set; }
    public DbSet<StockEntry> StockEntries { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<PrescribedMedicine> PrescribedMedicine { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply UserId filter explicitly for each entity
        modelBuilder.Entity<Medicine>().HasQueryFilter(e => EF.Property<string>(e, "UserId") == contextUser.UserId);
        modelBuilder.Entity<StockEntry>().HasQueryFilter(e => EF.Property<string>(e, "UserId") == contextUser.UserId);
        modelBuilder.Entity<Prescription>().HasQueryFilter(e => EF.Property<string>(e, "UserId") == contextUser.UserId);
    }
}
