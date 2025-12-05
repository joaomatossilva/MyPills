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
            .Where(x => x.UserId == userId).ToListAsync();

        Medicines = medicines.Select(x =>
        {
            if (x.StockQuantity > 0 && x.StockDate != default)
            {
                var dateTime = x.StockDate;
                var days = (dateTime - today).Days;
                var estimated = dateTime.AddDays(x.StockQuantity);
                return new MedicineStock(x.Id, x.Name, x.StockQuantity - days)
                {
                    EstimatedDate = estimated
                };
            }

            return new MedicineStock(x.Id, x.Name, 0)
            {
                EstimatedDate = today
            };
        }).ToList();
    }
}

public record MedicineStock(Guid MedicineId, string Name, int AvailableQuantity)
{
    [DisplayFormat(DataFormatString = "{0:d}")]
    public DateTimeOffset EstimatedDate { get; set; }
};
