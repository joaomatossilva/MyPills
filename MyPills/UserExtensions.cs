using System.Security.Claims;

namespace MyPills;

public static class UserExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) => user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}