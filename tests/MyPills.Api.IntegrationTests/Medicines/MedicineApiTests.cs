using System.Net;
using System.Net.Http.Json;
using MyPills.Api.IntegrationTests.Infrastructure;
using MyPills.Data;

namespace MyPills.Api.IntegrationTests.Medicines;

public sealed class MedicineApiTests
{
    [Fact]
    public async Task CreateMedicine_ThenGetDetails_ReturnsCreatedMedicine()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();
        var defaultProfile = await factory.GetDefaultProfileAsync();

        // Arrange
        var request = new
        {
            name = "Aspirin",
            boxSize = 20,
            dailyConsumption = 2,
            profileId = defaultProfile.Id
        };

        // Act
        using var createResponse = await client.PostAsJsonAsync("/api/medicines", request);
        var createdMedicine = await createResponse.ReadJsonAsync();
        var medicineId = createdMedicine.GetProperty("id").GetGuid();

        using var listResponse = await client.GetAsync("/api/medicines");
        var listPayload = await listResponse.ReadJsonAsync();
        var listedMedicine = listPayload.GetProperty("medicines").EnumerateArray().Single();

        using var detailsResponse = await client.GetAsync($"/api/medicines/{medicineId}");
        var medicineDetails = await detailsResponse.ReadJsonAsync();

        // Assert
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.Equal("Aspirin", createdMedicine.GetProperty("name").GetString());
        Assert.Equal(20, createdMedicine.GetProperty("boxSize").GetInt32());
        Assert.Equal(2, createdMedicine.GetProperty("dailyConsumption").GetInt32());
        Assert.Equal(defaultProfile.Id, createdMedicine.GetProperty("profileId").GetGuid());
        Assert.Equal(medicineId, listedMedicine.GetProperty("id").GetGuid());
        Assert.Equal(2, listedMedicine.GetProperty("dailyConsumption").GetInt32());
        Assert.Equal(defaultProfile.Id, listedMedicine.GetProperty("profileId").GetGuid());
        Assert.Equal(medicineId, medicineDetails.GetProperty("id").GetGuid());
        Assert.Equal("Aspirin", medicineDetails.GetProperty("name").GetString());
        Assert.Equal(20, medicineDetails.GetProperty("boxSize").GetInt32());
        Assert.Equal(2, medicineDetails.GetProperty("dailyConsumption").GetInt32());
        Assert.Equal(defaultProfile.Id, medicineDetails.GetProperty("profileId").GetGuid());
        Assert.Equal(0, medicineDetails.GetProperty("stockQuantity").GetInt32());
        Assert.Equal(0, medicineDetails.GetProperty("stockEntries").GetArrayLength());
    }

    [Fact]
    public async Task CreateMedicine_WithoutDailyConsumption_UsesDefaultValue()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();
        var defaultProfile = await factory.GetDefaultProfileAsync();

        var request = new
        {
            name = "Ibuprofen",
            boxSize = 10,
            profileId = defaultProfile.Id
        };

        using var response = await client.PostAsJsonAsync("/api/medicines", request);
        var payload = await response.ReadJsonAsync();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(1, payload.GetProperty("dailyConsumption").GetInt32());
    }

    [Fact]
    public async Task UpdateMedicine_UpdatesDailyConsumption()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        var medicineId = Guid.NewGuid();
        var profile = await factory.GetDefaultProfileAsync();

        await factory.SeedAsync(new Medicine
        {
            Id = medicineId,
            ProfileId = profile.Id,
            Name = "Magnesium",
            BoxSize = 30,
            DailyConsumption = 1,
            Prescriptions = []
        });

        var request = new
        {
            name = "Magnesium",
            boxSize = 60,
            dailyConsumption = 3
        };

        using var updateResponse = await client.PutAsJsonAsync($"/api/medicines/{medicineId}", request);
        var updatedMedicine = await updateResponse.ReadJsonAsync();

        using var detailsResponse = await client.GetAsync($"/api/medicines/{medicineId}");
        var detailsPayload = await detailsResponse.ReadJsonAsync();

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.Equal(60, updatedMedicine.GetProperty("boxSize").GetInt32());
        Assert.Equal(3, updatedMedicine.GetProperty("dailyConsumption").GetInt32());
        Assert.Equal(profile.Id, updatedMedicine.GetProperty("profileId").GetGuid());
        Assert.Equal(60, detailsPayload.GetProperty("boxSize").GetInt32());
        Assert.Equal(3, detailsPayload.GetProperty("dailyConsumption").GetInt32());
    }
}
