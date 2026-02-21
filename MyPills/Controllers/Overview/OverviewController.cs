using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Controllers.Overview;

[ApiController]
[Route("api/overview")]
[Authorize]
public sealed class OverviewController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetOverviewResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAsync()
    {
        var today = DateTime.Today;
        var medicines = await dbContext.Medicines
            .Include(x => x.Prescriptions)
            .ThenInclude(x => x.Prescription)
            .AsSplitQuery()
            .ToListAsync();

        var response = new GetOverviewResponse
        {
            Medicines = medicines.Select(x =>
            {
                var inPrescription = x.Prescriptions
                    .Where(m => m.Prescription.ExpiryDate >= today)
                    .Select(m => m.Quantity - m.ConsumedQuantity)
                    .Sum();

                if (x.StockQuantity > 0 && x.StockDate != default)
                {
                    var dateTime = x.StockDate.DateTime;
                    var days = (today - dateTime.Date).Days;
                    var estimated = x.StockDate.AddDays(x.StockQuantity);

                    return new OverviewMedicineDto
                    {
                        MedicineId = x.Id,
                        Name = x.Name,
                        AvailableQuantity = x.StockQuantity - days,
                        BoxesInPrescription = inPrescription,
                        EstimatedDate = estimated
                    };
                }

                return new OverviewMedicineDto
                {
                    MedicineId = x.Id,
                    Name = x.Name,
                    AvailableQuantity = 0,
                    BoxesInPrescription = inPrescription,
                    EstimatedDate = today
                };
            }).ToList()
        };

        return Ok(response);
    }
}
