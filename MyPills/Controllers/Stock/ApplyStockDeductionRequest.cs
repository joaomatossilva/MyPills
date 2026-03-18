using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Stock;

public sealed class ApplyStockDeductionRequest
{
    public Guid MedicineId { get; init; }

    [Required]
    public List<ApplyStockDeductionPrescriptionQuantityRequest> Prescriptions { get; init; } = [];
}

