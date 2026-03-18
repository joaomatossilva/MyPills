namespace MyPills.Controllers.Stock;

public sealed class GetStockDeductionPreviewPrescriptionItem
{
    public Guid PrescriptionId { get; init; }
    public DateOnly Date { get; init; }
    public int Available { get; init; }
    public int Quantity { get; init; }
}

