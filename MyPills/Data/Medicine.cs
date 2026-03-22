using System.ComponentModel.DataAnnotations;
namespace MyPills.Data;

public class Medicine
{
    public Guid Id { get; set; } = Guid.Empty;

    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int BoxSize { get; set; } = 0;
    public int DailyConsumption { get; set; } = 1;
    
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTimeOffset StockDate { get; set; }
    public int StockQuantity { get; set; }
    
    public ICollection<PrescribedMedicine> Prescriptions { get; set; } = [];
}
