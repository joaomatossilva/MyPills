using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using MyPills.Api.IntegrationTests.Infrastructure;
using MyPills.Data;

namespace MyPills.Api.IntegrationTests.Stock;

public sealed class StockApiTests
{
    [Fact]
    public async Task CreateStockEntry_WithActivePrescription_ReturnsDeductionRequirementAndUpdatesStock()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        // Arrange
        var prescriptionDate = DateOnly.FromDateTime(DateTime.Today);
        var expiryDate = prescriptionDate.AddDays(14);

        using var createMedicineResponse = await client.PostAsJsonAsync(
            "/api/medicines",
            new
            {
                name = "Amoxicillin",
                boxSize = 10
            });
        var medicine = await createMedicineResponse.ReadJsonAsync();
        var medicineId = medicine.GetProperty("id").GetGuid();

        using var createPrescriptionResponse = await client.PostAsJsonAsync(
            "/api/prescriptions",
            new
            {
                date = prescriptionDate,
                expiryDate
            });
        var prescription = await createPrescriptionResponse.ReadJsonAsync();
        var prescriptionId = prescription.GetProperty("id").GetGuid();

        using var addPrescriptionMedicineResponse = await client.PostAsJsonAsync(
            $"/api/prescriptions/{prescriptionId}/medicines",
            new
            {
                medicineId,
                quantity = 2,
                consumedQuantity = 0
            });

        // Act
        using var createStockEntryResponse = await client.PostAsJsonAsync(
            "/api/stock",
            new
            {
                medicineId,
                quantity = 2,
                type = StockEntryType.Box
            });
        var stockEntry = await createStockEntryResponse.ReadJsonAsync();

        using var medicineDetailsResponse = await client.GetAsync($"/api/medicines/{medicineId}");
        var medicineDetails = await medicineDetailsResponse.ReadJsonAsync();

        // Assert
        Assert.Equal(HttpStatusCode.Created, createStockEntryResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, medicineDetailsResponse.StatusCode);
        Assert.True(stockEntry.GetProperty("requiresPrescriptionDeduction").GetBoolean());
        Assert.Equal(2, stockEntry.GetProperty("deductionBoxes").GetInt32());
        Assert.Equal(20, medicineDetails.GetProperty("stockQuantity").GetInt32());
        Assert.Equal(1, medicineDetails.GetProperty("stockEntries").GetArrayLength());
        Assert.NotNull(medicineDetails.GetProperty("stockDate").GetString());
    }

    [Fact]
    public async Task PreviewAndApplyPrescriptionDeductions_UpdatesConsumedQuantities()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        // Arrange
        var medicineId = Guid.NewGuid();
        var firstPrescriptionId = Guid.NewGuid();
        var secondPrescriptionId = Guid.NewGuid();
        var today = DateTime.Today;

        await factory.SeedAsync(
            new Medicine
            {
                Id = medicineId,
                UserId = TestAuthenticationHandler.UserId,
                Name = "Metformin",
                BoxSize = 60,
                StockDate = DateTimeOffset.UtcNow,
                StockQuantity = 120,
                Prescriptions = []
            },
            new Prescription
            {
                Id = firstPrescriptionId,
                UserId = TestAuthenticationHandler.UserId,
                Date = today.AddDays(-10),
                ExpiryDate = today.AddDays(20),
                Medicines =
                [
                    new PrescribedMedicine
                    {
                        PrescriptionId = firstPrescriptionId,
                        MedicineId = medicineId,
                        Quantity = 2,
                        ConsumedQuantity = 0
                    }
                ]
            },
            new Prescription
            {
                Id = secondPrescriptionId,
                UserId = TestAuthenticationHandler.UserId,
                Date = today.AddDays(-5),
                ExpiryDate = today.AddDays(25),
                Medicines =
                [
                    new PrescribedMedicine
                    {
                        PrescriptionId = secondPrescriptionId,
                        MedicineId = medicineId,
                        Quantity = 3,
                        ConsumedQuantity = 1
                    }
                ]
            });

        // Act
        using var previewResponse = await client.GetAsync($"/api/stock/prescription-deductions?medicineId={medicineId}&boxes=3");
        var preview = await previewResponse.ReadJsonAsync();
        var previewItems = preview.GetProperty("prescriptions").EnumerateArray().ToArray();

        using var applyResponse = await client.PostAsJsonAsync(
            "/api/stock/prescription-deductions",
            new
            {
                medicineId,
                prescriptions = new[]
                {
                    new
                    {
                        prescriptionId = firstPrescriptionId,
                        quantity = 2
                    },
                    new
                    {
                        prescriptionId = secondPrescriptionId,
                        quantity = 1
                    }
                }
            });
        var appliedDeductions = await applyResponse.ReadJsonAsync();

        var consumedQuantities = await factory.ExecuteDbContextAsync(async dbContext =>
            await dbContext.PrescribedMedicine
                .AsNoTracking()
                .Where(x => x.MedicineId == medicineId)
                .OrderBy(x => x.PrescriptionId)
                .Select(x => x.ConsumedQuantity)
                .ToArrayAsync());

        // Assert
        Assert.Equal(HttpStatusCode.OK, previewResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, applyResponse.StatusCode);
        Assert.Equal(2, previewItems.Length);
        Assert.Equal(firstPrescriptionId, previewItems[0].GetProperty("prescriptionId").GetGuid());
        Assert.Equal(2, previewItems[0].GetProperty("available").GetInt32());
        Assert.Equal(2, previewItems[0].GetProperty("quantity").GetInt32());
        Assert.Equal(secondPrescriptionId, previewItems[1].GetProperty("prescriptionId").GetGuid());
        Assert.Equal(2, previewItems[1].GetProperty("available").GetInt32());
        Assert.Equal(1, previewItems[1].GetProperty("quantity").GetInt32());
        Assert.Equal(medicineId, appliedDeductions.GetProperty("medicineId").GetGuid());
        Assert.Equal(2, appliedDeductions.GetProperty("updatedPrescriptions").GetInt32());
        Assert.Equal([2, 2], consumedQuantities);
    }
}
