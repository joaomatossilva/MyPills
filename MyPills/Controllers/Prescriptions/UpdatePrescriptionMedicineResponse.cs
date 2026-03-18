namespace MyPills.Controllers.Prescriptions;

public sealed class UpdatePrescriptionMedicineResponse
{
    public Guid PrescriptionId { get; init; }
    public Guid MedicineId { get; init; }
    public string MedicineName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public int ConsumedQuantity { get; init; }
}

