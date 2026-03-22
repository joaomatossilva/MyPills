namespace MyPills.Controllers.Prescriptions;

public sealed class CreatePrescriptionResponse
{
    public Guid Id { get; init; }
    public Guid ProfileId { get; init; }
    public string ProfileName { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public DateOnly ExpiryDate { get; init; }
}

