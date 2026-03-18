using System.ComponentModel.DataAnnotations;
using MyPills.Data;

namespace MyPills.Controllers.Stock;

public sealed class CreateStockEntryRequest
{
    public Guid MedicineId { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }

    [EnumDataType(typeof(StockEntryType))]
    public StockEntryType Type { get; init; }
}

