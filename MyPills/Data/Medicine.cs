using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace MyPills.Data;

public class Medicine
{
    public Guid Id { get; set; } = Guid.Empty;
    
    public string UserId { get; set; }
    public virtual IdentityUser User { get; set; }
    
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int BoxSize { get; set; } = 0;
    
    public DateTime StockDate { get; set; }
    public int StockQuantity { get; set; }
}