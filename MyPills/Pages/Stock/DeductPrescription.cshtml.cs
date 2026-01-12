using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages.Stock;

public class DeductPrescription(ApplicationDbContext dbContext) : PageModel
{
    [BindProperty]
    public PrescriptionModel[] Prescriptions { get; set; }
    
    public async Task<IActionResult> OnGet(Guid? mId, int boxes)
    {
        var userId = User.GetUserId();
        var today = DateTime.Today;
        var prescriptions = await dbContext.Prescriptions
            .Include(p => p.Medicines)
            .Where(p => p.UserId == userId && p.ExpiryDate > today &&
                        p.Medicines.Any(x => x.MedicineId == mId && x.Quantity > x.ConsumedQuantity))
            .ToListAsync();

        if (prescriptions.Count == 0)
        {
            return RedirectToPage("/Overview");
        }
        
        Prescriptions = prescriptions
            .Select(x =>
            {
                var available = x.Medicines.Where(m => m.MedicineId == mId).Sum(m => m.Quantity - m.ConsumedQuantity);
                var quantity = boxes > available ? available : boxes;
                boxes -= quantity;
                if (boxes < 0)
                {
                    boxes = 0;
                }
                
                return new PrescriptionModel(
                    x.Id,
                    available,
                    quantity)
                {
                    Date = x.Date
                };
            }).ToArray();
        
        return Page();
    }

    public async Task<IActionResult> OnPost(Guid? mId, int boxes)
    {
        var userId = User.GetUserId();
        var prescriptionIds = Prescriptions.Select(x => x.Id).ToArray();

        var medicines = await dbContext.PrescribedMedicine
            .Where(x => x.Prescription.UserId == userId && x.MedicineId == mId && prescriptionIds.Contains(x.PrescriptionId))
            .ToListAsync();

        foreach (var medicine in medicines)
        {
            var prescriptionQuantity = Prescriptions.FirstOrDefault(x => x.Id == medicine.PrescriptionId);
            if (prescriptionQuantity == null)
            {
                continue;
            }
            
            medicine.ConsumedQuantity += prescriptionQuantity.Quantity;
        }
        
        await dbContext.SaveChangesAsync();
        
        return RedirectToPage("/Overview");
    }

    public record PrescriptionModel(Guid Id, int Available, int Quantity)
    {
        public DateTime Date { get; set; }
    }
}