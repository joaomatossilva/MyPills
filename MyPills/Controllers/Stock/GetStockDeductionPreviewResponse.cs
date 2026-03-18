namespace MyPills.Controllers.Stock;

public sealed class GetStockDeductionPreviewResponse
{
    public Guid MedicineId { get; init; }
    public int Boxes { get; init; }
    public List<GetStockDeductionPreviewPrescriptionItem> Prescriptions { get; init; } = [];
}

