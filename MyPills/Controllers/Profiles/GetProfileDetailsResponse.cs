namespace MyPills.Controllers.Profiles;

public sealed class GetProfileDetailsResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public string OwnerUsername { get; init; } = string.Empty;
}
