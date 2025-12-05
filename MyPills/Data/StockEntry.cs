using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace MyPills.Data;

public class StockEntry
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public virtual Medicine Medicine { get; set; }
    [Required]
    public string UserId { get; set; }
    public virtual IdentityUser User { get; set; }
    public DateTimeOffset Date { get; set; }
    public int Quantity { get; set; }
    public StockEntryType Type { get; set; }
}

public enum StockEntryType
{
    Box = 1,
    Manual = 2
}