using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;
using MyPills.Services;

namespace MyPills.Controllers.Overview;

[ApiController]
[Route("api/overview")]
[Authorize]
public sealed class OverviewController(ApplicationDbContext dbContext, ProfileAccessService profileAccessService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(GetOverviewResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAsync()
    {
        await profileAccessService.EnsureCurrentUserInitializedAsync();

        var today = DateTime.Today;
        var accessibleProfileIds = profileAccessService.QueryAccessibleProfiles(ProfilePermission.View).Select(x => x.Id);
        var medicines = await dbContext.Medicines
            .Include(x => x.Prescriptions)
            .ThenInclude(x => x.Prescription)
            .Where(x => accessibleProfileIds.Contains(x.ProfileId))
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
                    var days = (today - x.StockDate.Date).Days;
                    var estimatedDays = x.StockQuantity / x.DailyConsumption;
                    var estimated = x.StockDate.AddDays(estimatedDays);

                    return new OverviewMedicineDto
                    {
                        MedicineId = x.Id,
                        Name = x.Name,
                        DailyConsumption = x.DailyConsumption,
                        AvailableQuantity = x.StockQuantity - (days * x.DailyConsumption),
                        BoxesInPrescription = inPrescription,
                        EstimatedDate = estimated
                    };
                }

                return new OverviewMedicineDto
                {
                    MedicineId = x.Id,
                    Name = x.Name,
                    DailyConsumption = x.DailyConsumption,
                    AvailableQuantity = 0,
                    BoxesInPrescription = inPrescription,
                    EstimatedDate = today
                };
            }).ToList()
        };

        return Ok(response);
    }
}
