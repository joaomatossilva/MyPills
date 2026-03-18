namespace MyPills.Controllers.Stock;

public sealed class ApplyStockDeductionResponse
{
    public Guid MedicineId { get; init; }
    public int UpdatedPrescriptions { get; init; }
}

