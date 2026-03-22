namespace MyPills.Controllers.Medicines;

public sealed class GetMedicineDetailsResponse
{
    public Guid Id { get; init; }
    public Guid ProfileId { get; init; }
    public string ProfileName { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int BoxSize { get; init; }
    public int DailyConsumption { get; init; }
    public int StockQuantity { get; init; }
    public DateTimeOffset? StockDate { get; init; }
    public bool CanEdit { get; init; }
    public List<GetMedicineDetailsStockEntry> StockEntries { get; init; } = [];
}

