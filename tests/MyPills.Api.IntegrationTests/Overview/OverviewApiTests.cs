using System.Net;
using MyPills.Api.IntegrationTests.Infrastructure;
using MyPills.Data;

namespace MyPills.Api.IntegrationTests.Overview;

public sealed class OverviewApiTests
{
    [Fact]
    public async Task GetOverview_ReturnsAggregatedAvailabilityForMedicines()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();
        var profile = await factory.GetDefaultProfileAsync();

        // Arrange
        var medicineId = Guid.NewGuid();
        var prescriptionId = Guid.NewGuid();
        var stockDate = DateTimeOffset.UtcNow.Date.AddDays(-2);

        await factory.SeedAsync(
            new Medicine
            {
                Id = medicineId,
                ProfileId = profile.Id,
                Name = "Vitamin D",
                BoxSize = 30,
                DailyConsumption = 2,
                StockDate = stockDate,
                StockQuantity = 10,
                Prescriptions = []
            },
            new Prescription
            {
                Id = prescriptionId,
                ProfileId = profile.Id,
                Date = DateTime.Today.AddDays(-4),
                ExpiryDate = DateTime.Today.AddDays(20),
                Medicines =
                [
                    new PrescribedMedicine
                    {
                        PrescriptionId = prescriptionId,
                        MedicineId = medicineId,
                        Quantity = 4,
                        ConsumedQuantity = 1
                    }
                ]
            });

        // Act
        using var response = await client.GetAsync("/api/overview");
        var payload = await response.ReadJsonAsync();
        var medicine = payload.GetProperty("medicines").EnumerateArray().Single();
        var estimatedDate = DateTimeOffset.Parse(medicine.GetProperty("estimatedDate").GetString()!);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(medicineId, medicine.GetProperty("medicineId").GetGuid());
        Assert.Equal("Vitamin D", medicine.GetProperty("name").GetString());
        Assert.Equal(2, medicine.GetProperty("dailyConsumption").GetInt32());
        Assert.Equal(6, medicine.GetProperty("availableQuantity").GetInt32());
        Assert.Equal(3, medicine.GetProperty("boxesInPrescription").GetInt32());
        Assert.Equal(stockDate.AddDays(5).Date, estimatedDate.Date);
    }

    [Fact]
    public async Task GetOverview_WithProfileId_ReturnsOnlySelectedProfileMedicines()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();
        var selectedProfile = await factory.GetDefaultProfileAsync();
        var otherProfileId = Guid.NewGuid();

        await factory.SeedAsync(
            new Profile
            {
                Id = otherProfileId,
                OwnerId = "test-user-id",
                Name = "Other Profile",
                IsDefault = false
            },
            new Medicine
            {
                Id = Guid.NewGuid(),
                ProfileId = selectedProfile.Id,
                Name = "Selected Overview Medicine",
                BoxSize = 30,
                DailyConsumption = 1,
                StockDate = DateTimeOffset.UtcNow,
                StockQuantity = 12,
                Prescriptions = []
            },
            new Medicine
            {
                Id = Guid.NewGuid(),
                ProfileId = otherProfileId,
                Name = "Other Overview Medicine",
                BoxSize = 30,
                DailyConsumption = 1,
                StockDate = DateTimeOffset.UtcNow,
                StockQuantity = 20,
                Prescriptions = []
            });

        using var response = await client.GetAsync($"/api/overview?profileId={selectedProfile.Id}");
        var payload = await response.ReadJsonAsync();
        var medicines = payload.GetProperty("medicines").EnumerateArray().ToArray();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(medicines);
        Assert.Equal("Selected Overview Medicine", medicines[0].GetProperty("name").GetString());
    }
}
