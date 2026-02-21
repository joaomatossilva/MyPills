namespace MyPills.Controllers.Overview;

public sealed class GetOverviewResponse
{
    public required IReadOnlyList<OverviewMedicineDto> Medicines { get; init; }
}
