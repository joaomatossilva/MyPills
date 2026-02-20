using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext(options)
{
    public DbSet<Medicine> Medicines { get; set; }
    public DbSet<StockEntry> StockEntries { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<PrescribedMedicine> PrescribedMedicine { get; set; }
}
