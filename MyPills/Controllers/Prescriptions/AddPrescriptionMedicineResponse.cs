namespace MyPills.Controllers.Prescriptions;

public sealed class AddPrescriptionMedicineResponse
{
    public Guid PrescriptionId { get; init; }
    public Guid MedicineId { get; init; }
    public string MedicineName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public int ConsumedQuantity { get; init; }
}

