using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Stock;

public sealed class ApplyStockDeductionPrescriptionQuantityRequest
{
    public Guid PrescriptionId { get; init; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; init; }
}

