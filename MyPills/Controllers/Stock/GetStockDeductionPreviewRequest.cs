using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Stock;

public sealed class GetStockDeductionPreviewRequest
{
    public Guid MedicineId { get; init; }

    [Range(1, int.MaxValue)]
    public int Boxes { get; init; }
}

