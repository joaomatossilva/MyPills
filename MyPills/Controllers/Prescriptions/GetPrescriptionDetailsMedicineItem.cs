namespace MyPills.Controllers.Prescriptions;

public sealed class GetPrescriptionDetailsMedicineItem
{
    public Guid MedicineId { get; init; }
    public string MedicineName { get; init; } = string.Empty;
    public int BoxSize { get; init; }
    public int Quantity { get; init; }
    public int ConsumedQuantity { get; init; }
}

