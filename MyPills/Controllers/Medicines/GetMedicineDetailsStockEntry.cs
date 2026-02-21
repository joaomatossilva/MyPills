using MyPills.Data;

namespace MyPills.Controllers.Medicines;

public sealed class GetMedicineDetailsStockEntry
{
    public Guid Id { get; init; }
    public DateTimeOffset Date { get; init; }
    public int Quantity { get; init; }
    public StockEntryType Type { get; init; }
}

