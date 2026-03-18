using System.Net;
using System.Net.Http.Json;
using MyPills.Api.IntegrationTests.Infrastructure;

namespace MyPills.Api.IntegrationTests.Prescriptions;

public sealed class PrescriptionApiTests
{
    [Fact]
    public async Task CreatePrescription_AddMedicine_ThenGetDetails_ReturnsPrescriptionWithMedicine()
    {
        await using var factory = new MyPillsApplicationFactory();
        using var client = factory.CreateApiClient();

        // Arrange
        var prescriptionDate = DateOnly.FromDateTime(DateTime.Today);
        var expiryDate = prescriptionDate.AddDays(30);

        using var createMedicineResponse = await client.PostAsJsonAsync(
            "/api/medicines",
            new
            {
                name = "Ibuprofen",
                boxSize = 30
            });
        var medicine = await createMedicineResponse.ReadJsonAsync();
        var medicineId = medicine.GetProperty("id").GetGuid();

        // Act
        using var createPrescriptionResponse = await client.PostAsJsonAsync(
            "/api/prescriptions",
            new
            {
                date = prescriptionDate,
                expiryDate
            });
        var createdPrescription = await createPrescriptionResponse.ReadJsonAsync();
        var prescriptionId = createdPrescription.GetProperty("id").GetGuid();

        using var addMedicineResponse = await client.PostAsJsonAsync(
            $"/api/prescriptions/{prescriptionId}/medicines",
            new
            {
                medicineId,
                quantity = 3,
                consumedQuantity = 1
            });
        var addedMedicine = await addMedicineResponse.ReadJsonAsync();

        using var detailsResponse = await client.GetAsync($"/api/prescriptions/{prescriptionId}");
        var prescriptionDetails = await detailsResponse.ReadJsonAsync();
        var prescriptionMedicine = prescriptionDetails.GetProperty("medicines").EnumerateArray().Single();

        // Assert
        Assert.Equal(HttpStatusCode.Created, createPrescriptionResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Created, addMedicineResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.Equal(prescriptionDate.ToString("yyyy-MM-dd"), createdPrescription.GetProperty("date").GetString());
        Assert.Equal(expiryDate.ToString("yyyy-MM-dd"), createdPrescription.GetProperty("expiryDate").GetString());
        Assert.Equal(prescriptionId, addedMedicine.GetProperty("prescriptionId").GetGuid());
        Assert.Equal(medicineId, addedMedicine.GetProperty("medicineId").GetGuid());
        Assert.Equal("Ibuprofen", prescriptionMedicine.GetProperty("medicineName").GetString());
        Assert.Equal(30, prescriptionMedicine.GetProperty("boxSize").GetInt32());
        Assert.Equal(3, prescriptionMedicine.GetProperty("quantity").GetInt32());
        Assert.Equal(1, prescriptionMedicine.GetProperty("consumedQuantity").GetInt32());
    }
}
