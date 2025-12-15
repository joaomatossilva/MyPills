using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages;

public class OverviewModel(ApplicationDbContext dbContext) : PageModel
{
    public IList<MedicineStock> Medicines { get;set; } = default!;

    public async Task OnGetAsync()
    {
        var today = DateTime.Today;
        var userId = User.GetUserId();
        var medicines = await dbContext.Medicines
            .Include(x => x.Prescriptions)
            .ThenInclude(x => x.Prescription)
            .AsSplitQuery()
            .Where(x => x.UserId == userId)
            .ToListAsync();

        Medicines = medicines.Select(x =>
        {
            var inPrescription = x.Prescriptions.Where(m => m.Prescription.ExpiryDate >= today)
                .Select(m => m.Quantity - m.ConsumedQuantity)
                .Sum();

            if (x.StockQuantity > 0 && x.StockDate != default)
            {
                var dateTime = x.StockDate;
                var days = (dateTime - today).Days;
                var estimated = dateTime.AddDays(x.StockQuantity);
                return new MedicineStock(x.Id, x.Name, x.StockQuantity - days, inPrescription)
                {
                    EstimatedDate = estimated
                };
            }

            return new MedicineStock(x.Id, x.Name, 0, inPrescription)
            {
                EstimatedDate = today
            };
        }).ToList();
    }
}

public record MedicineStock(Guid MedicineId, string Name, int AvailableQuantity, int BoxesInPrescription)
{
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTimeOffset EstimatedDate { get; set; }
};
