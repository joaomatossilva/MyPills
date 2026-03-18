using System.ComponentModel.DataAnnotations;

namespace MyPills.Controllers.Prescriptions;

public sealed class AddPrescriptionMedicineRequest
{
    public Guid MedicineId { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(0, int.MaxValue)]
    public int ConsumedQuantity { get; init; }
}

