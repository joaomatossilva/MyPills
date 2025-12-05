using System.ComponentModel.DataAnnotations;

namespace MyPills.Data;

public class Medicine
{
    public Guid Id { get; set; } = Guid.Empty;
    
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int BoxSize { get; set; } = 0;
}