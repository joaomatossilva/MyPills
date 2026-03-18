using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MyPills;

namespace MyPills.Api.IntegrationTests.Infrastructure;

internal sealed class TestContextUser(IHttpContextAccessor httpContextAccessor) : IContextUser
{
    public string? UserId =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? TestAuthenticationHandler.UserId;
}
