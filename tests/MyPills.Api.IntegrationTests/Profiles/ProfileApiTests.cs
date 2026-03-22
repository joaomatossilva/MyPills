using System.Net;
using System.Net.Http.Json;
using MyPills.Api.IntegrationTests.Infrastructure;

namespace MyPills.Api.IntegrationTests.Profiles;

public sealed class ProfileApiTests
{
    [Fact]
    public async Task GetProfiles_ReturnsDefaultProfile()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        using var profilesResponse = await client.GetAsync("/api/profiles");
        var profilesPayload = await profilesResponse.ReadJsonAsync();
        var profile = profilesPayload.GetProperty("profiles").EnumerateArray().Single();

        Assert.Equal(HttpStatusCode.OK, profilesResponse.StatusCode);
        Assert.Equal("Default Profile", profile.GetProperty("name").GetString());
        Assert.True(profile.GetProperty("isDefault").GetBoolean());
    }

    [Fact]
    public async Task GetProfileDetails_ReturnsOwnedProfile()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();
        var defaultProfile = await factory.GetDefaultProfileAsync();

        using var detailsResponse = await client.GetAsync($"/api/profiles/{defaultProfile.Id}");
        var detailsPayload = await detailsResponse.ReadJsonAsync();

        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.Equal(defaultProfile.Id, detailsPayload.GetProperty("id").GetGuid());
        Assert.Equal("Default Profile", detailsPayload.GetProperty("name").GetString());
        Assert.True(detailsPayload.GetProperty("isDefault").GetBoolean());
    }

    [Fact]
    public async Task OtherUsers_CannotAccessAnotherUsersProfilesOrData()
    {
        await using var factory = new MyPillsApplicationFactory();
        await factory.SeedUserAsync("other-user-id", "other.user@example.com");

        using var otherClient = factory.CreateApiClient("other-user-id", "other.user@example.com");
        var ownerDefaultProfile = await factory.GetDefaultProfileAsync();

        using var otherProfilesResponse = await otherClient.GetAsync("/api/profiles");
        using var otherProfileDetailsResponse = await otherClient.GetAsync($"/api/profiles/{ownerDefaultProfile.Id}");
        using var createMedicineResponse = await otherClient.PostAsJsonAsync("/api/medicines", new
        {
            profileId = ownerDefaultProfile.Id,
            name = "Unauthorized Aspirin",
            boxSize = 20,
            dailyConsumption = 1
        });

        var otherProfilesPayload = await otherProfilesResponse.ReadJsonAsync();
        var otherProfileIds = otherProfilesPayload.GetProperty("profiles")
            .EnumerateArray()
            .Select(x => x.GetProperty("id").GetGuid())
            .ToArray();

        Assert.Equal(HttpStatusCode.OK, otherProfilesResponse.StatusCode);
        Assert.DoesNotContain(ownerDefaultProfile.Id, otherProfileIds);
        Assert.Equal(HttpStatusCode.NotFound, otherProfileDetailsResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, createMedicineResponse.StatusCode);
    }
}
