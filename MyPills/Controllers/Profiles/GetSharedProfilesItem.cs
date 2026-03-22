namespace MyPills.Controllers.Profiles;

public sealed class GetSharedProfilesItem
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string OwnerUsername { get; init; } = string.Empty;
    public string Permission { get; init; } = string.Empty;
}
