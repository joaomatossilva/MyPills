namespace MyPills.Controllers.Profiles;

public sealed class GetEditableProfilesItem
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string OwnerUsername { get; init; } = string.Empty;
    public bool IsOwned { get; init; }
}
