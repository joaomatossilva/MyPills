namespace MyPills.Controllers.Prescriptions;

public sealed class UpdatePrescriptionResponse
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public DateOnly ExpiryDate { get; init; }
}

