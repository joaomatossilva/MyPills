using System.Net;
using System.Net.Http.Json;
using MyPills.Api.IntegrationTests.Infrastructure;

namespace MyPills.Api.IntegrationTests.Medicines;

public sealed class MedicineApiTests
{
    [Fact]
    public async Task CreateMedicine_ThenGetDetails_ReturnsCreatedMedicine()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        // Arrange
        var request = new
        {
            name = "Aspirin",
            boxSize = 20
        };

        // Act
        using var createResponse = await client.PostAsJsonAsync("/api/medicines", request);
        var createdMedicine = await createResponse.ReadJsonAsync();
        var medicineId = createdMedicine.GetProperty("id").GetGuid();

        using var detailsResponse = await client.GetAsync($"/api/medicines/{medicineId}");
        var medicineDetails = await detailsResponse.ReadJsonAsync();

        // Assert
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.Equal("Aspirin", createdMedicine.GetProperty("name").GetString());
        Assert.Equal(20, createdMedicine.GetProperty("boxSize").GetInt32());
        Assert.Equal(medicineId, medicineDetails.GetProperty("id").GetGuid());
        Assert.Equal("Aspirin", medicineDetails.GetProperty("name").GetString());
        Assert.Equal(20, medicineDetails.GetProperty("boxSize").GetInt32());
        Assert.Equal(0, medicineDetails.GetProperty("stockQuantity").GetInt32());
        Assert.Equal(0, medicineDetails.GetProperty("stockEntries").GetArrayLength());
    }
}
