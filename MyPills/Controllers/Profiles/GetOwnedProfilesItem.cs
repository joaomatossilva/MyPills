namespace MyPills.Controllers.Profiles;

public sealed class GetOwnedProfilesItem
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}
