using System.ComponentModel.DataAnnotations;
namespace MyPills.Data;

public class StockEntry
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;
    public Guid ProfileId { get; set; }
    public Profile Profile { get; set; } = null!;
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTimeOffset Date { get; set; }
    public int Quantity { get; set; }
    public StockEntryType Type { get; set; }
}

public enum StockEntryType
{
    Box = 1,
    Increase = 2,
    Decrease = 3,
    Set = 4
}
