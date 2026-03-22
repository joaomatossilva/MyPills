using System.ComponentModel.DataAnnotations;

namespace MyPills.Data;

public sealed class Profile
{
    public Guid Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public string OwnerId { get; set; } = string.Empty;
    public ApplicationUser Owner { get; set; } = null!;

    public ICollection<Medicine> Medicines { get; set; } = [];
    public ICollection<Prescription> Prescriptions { get; set; } = [];
    public ICollection<StockEntry> StockEntries { get; set; } = [];
}
