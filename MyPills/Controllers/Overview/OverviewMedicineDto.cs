namespace MyPills.Controllers.Overview;

public sealed class OverviewMedicineDto
{
    public required Guid MedicineId { get; init; }
    public required string Name { get; init; }
    public required int AvailableQuantity { get; init; }
    public required int BoxesInPrescription { get; init; }
    public required DateTimeOffset EstimatedDate { get; init; }
}

