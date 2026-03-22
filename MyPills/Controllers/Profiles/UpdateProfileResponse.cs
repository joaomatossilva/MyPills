namespace MyPills.Controllers.Profiles;

public sealed class UpdateProfileResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}
