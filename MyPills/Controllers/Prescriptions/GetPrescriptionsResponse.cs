namespace MyPills.Controllers.Prescriptions;

public sealed class GetPrescriptionsResponse
{
    public List<GetPrescriptionsItem> Prescriptions { get; init; } = [];
}

