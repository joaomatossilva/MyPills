namespace MyPills.Controllers.Profiles;

public sealed class ShareProfileResponse
{
    public Guid Id { get; init; }
    public string SharedWithUsername { get; init; } = string.Empty;
    public string SharedWithUserCode { get; init; } = string.Empty;
    public string Permission { get; init; } = string.Empty;
}
