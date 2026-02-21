namespace MyPills.Controllers.Auth;

public class GetAuthStatusResponse
{
    public required bool IsAuthenticated { get; init; }
    public required string? Username { get; init; }
}

