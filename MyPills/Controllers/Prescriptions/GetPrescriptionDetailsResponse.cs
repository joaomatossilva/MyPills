namespace MyPills.Controllers.Prescriptions;

public sealed class GetPrescriptionDetailsResponse
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public DateOnly ExpiryDate { get; init; }
    public List<GetPrescriptionDetailsMedicineItem> Medicines { get; init; } = [];
}

