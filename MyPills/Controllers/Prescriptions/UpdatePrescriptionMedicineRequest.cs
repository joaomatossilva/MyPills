using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Prescriptions;

public sealed class UpdatePrescriptionMedicineRequest
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(0, int.MaxValue)]
    public int ConsumedQuantity { get; init; }
}

