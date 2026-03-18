using System.Net;
using MyPills.Api.IntegrationTests.Infrastructure;

namespace MyPills.Api.IntegrationTests.Auth;

public sealed class GetAuthStatusTests
{
    [Fact]
    public async Task GetAuthStatus_ReturnsAuthenticatedUser()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        // Arrange

        // Act
        using var response = await client.GetAsync("/api/auth/status");
        var payload = await response.ReadJsonAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(payload.GetProperty("isAuthenticated").GetBoolean());
        Assert.Equal(TestAuthenticationHandler.UserName, payload.GetProperty("username").GetString());
    }
}
