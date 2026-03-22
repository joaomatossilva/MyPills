namespace MyPills.Controllers.Stock;

public sealed class CreateStockEntryResponse
{
    public Guid Id { get; init; }
    public Guid MedicineId { get; init; }
    public Guid ProfileId { get; init; }
    public string ProfileName { get; init; } = string.Empty;
    public DateTimeOffset Date { get; init; }
    public int Quantity { get; init; }
    public string Type { get; init; } = string.Empty;
    public bool RequiresPrescriptionDeduction { get; init; }
    public int DeductionBoxes { get; init; }
}

