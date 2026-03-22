using System.Net;
using System.Net.Http.Json;
using MyPills.Api.IntegrationTests.Infrastructure;

namespace MyPills.Api.IntegrationTests.Profiles;

public sealed class ProfileApiTests
{
    [Fact]
    public async Task GetProfiles_ReturnsDefaultProfileAndCurrentUserCode()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        using var profilesResponse = await client.GetAsync("/api/profiles");
        using var codeResponse = await client.GetAsync("/api/profiles/user-code");

        var profilesPayload = await profilesResponse.ReadJsonAsync();
        var codePayload = await codeResponse.ReadJsonAsync();
        var profile = profilesPayload.GetProperty("profiles").EnumerateArray().Single();

        Assert.Equal(HttpStatusCode.OK, profilesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, codeResponse.StatusCode);
        Assert.Equal("Default Profile", profile.GetProperty("name").GetString());
        Assert.True(profile.GetProperty("isDefault").GetBoolean());
        Assert.Equal("Aa0001", codePayload.GetProperty("shareCode").GetString());
    }

    [Fact]
    public async Task ShareAndRevokeProfile_UpdatesSharedUserVisibility()
    {
        await using var factory = new MyPillsApplicationFactory();
        await factory.SeedUserAsync("shared-user-id", "shared.user@example.com", "Bb0002");

        using var ownerClient = factory.CreateApiClient();
        using var sharedClient = factory.CreateApiClient("shared-user-id", "shared.user@example.com");
        var defaultProfile = await factory.GetDefaultProfileAsync();

        using var shareResponse = await ownerClient.PostAsJsonAsync($"/api/profiles/{defaultProfile.Id}/shares", new
        {
            userCode = "Bb0002",
            permission = "view"
        });
        var sharePayload = await shareResponse.ReadJsonAsync();
        var shareId = sharePayload.GetProperty("id").GetGuid();

        using var sharedListResponse = await sharedClient.GetAsync("/api/profiles/shared");
        using var sharedDetailsResponse = await sharedClient.GetAsync($"/api/profiles/{defaultProfile.Id}");

        var sharedListPayload = await sharedListResponse.ReadJsonAsync();
        var sharedProfile = sharedListPayload.GetProperty("profiles").EnumerateArray().Single();

        Assert.Equal(HttpStatusCode.OK, shareResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, sharedListResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, sharedDetailsResponse.StatusCode);
        Assert.Equal(defaultProfile.Id, sharedProfile.GetProperty("id").GetGuid());
        Assert.Equal("view", sharedProfile.GetProperty("permission").GetString());

        using var revokeResponse = await ownerClient.DeleteAsync($"/api/profiles/{defaultProfile.Id}/shares/{shareId}");
        using var sharedListAfterRevokeResponse = await sharedClient.GetAsync("/api/profiles/shared");
        using var sharedDetailsAfterRevokeResponse = await sharedClient.GetAsync($"/api/profiles/{defaultProfile.Id}");

        var sharedListAfterRevokePayload = await sharedListAfterRevokeResponse.ReadJsonAsync();

        Assert.Equal(HttpStatusCode.OK, revokeResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, sharedListAfterRevokeResponse.StatusCode);
        Assert.Empty(sharedListAfterRevokePayload.GetProperty("profiles").EnumerateArray());
        Assert.Equal(HttpStatusCode.NotFound, sharedDetailsAfterRevokeResponse.StatusCode);
    }

    [Fact]
    public async Task EditSharedProfilePermission_AllowsCreatingMedicine()
    {
        await using var factory = new MyPillsApplicationFactory();
        await factory.SeedUserAsync("editor-user-id", "editor.user@example.com", "Cc0003");

        using var ownerClient = factory.CreateApiClient();
        using var editorClient = factory.CreateApiClient("editor-user-id", "editor.user@example.com");
        var defaultProfile = await factory.GetDefaultProfileAsync();

        using var shareResponse = await ownerClient.PostAsJsonAsync($"/api/profiles/{defaultProfile.Id}/shares", new
        {
            userCode = "Cc0003",
            permission = "edit"
        });

        using var createMedicineResponse = await editorClient.PostAsJsonAsync("/api/medicines", new
        {
            profileId = defaultProfile.Id,
            name = "Shared Aspirin",
            boxSize = 20,
            dailyConsumption = 1
        });
        var createdMedicine = await createMedicineResponse.ReadJsonAsync();

        using var ownerListResponse = await ownerClient.GetAsync("/api/medicines");
        var ownerListPayload = await ownerListResponse.ReadJsonAsync();

        Assert.Equal(HttpStatusCode.OK, shareResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Created, createMedicineResponse.StatusCode);
        Assert.Equal(defaultProfile.Id, createdMedicine.GetProperty("profileId").GetGuid());
        Assert.Equal("Shared Aspirin", createdMedicine.GetProperty("name").GetString());
        Assert.Equal(1, ownerListPayload.GetProperty("medicines").GetArrayLength());
    }
}
