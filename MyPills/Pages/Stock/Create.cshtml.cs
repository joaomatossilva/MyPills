using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using MyPills.Data;

namespace MyPills.Pages.Stock
{
    public class CreateModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public CreateModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult OnGet(Guid? id)
        {
            ViewData["MedicineId"] = new SelectList(
                _context.Medicines,
                "Id",
                "Name");
            StockEntry = new StockEntryModel(id ?? Guid.Empty, StockEntryType.Box, 1);
            return Page();
        }

        [BindProperty]
        public StockEntryModel StockEntry { get; set; } = default!;

        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var userId = User.GetUserId();
            var stockEntry = new StockEntry
            {
                UserId = userId,
                Date = DateTimeOffset.UtcNow,
                MedicineId = StockEntry.MedicineId,
                Quantity = StockEntry.Quantity!.Value,
                Type = StockEntry.Type
            };
            _context.StockEntries.Add(stockEntry);
            
            var medicine = _context.Medicines.FirstOrDefault(m => m.Id == stockEntry.MedicineId);
            if (medicine == null)
            {
                return Page();
            }

            var today =  DateTime.Today;
            var daysDiff = today.Subtract(medicine.StockDate.Date).Days;
            
            medicine.StockDate = today;
            medicine.StockQuantity = Math.Max(0, medicine.StockQuantity - daysDiff); //adjust the expected consumption
            if (StockEntry.Type == StockEntryType.Manual)
            {
                medicine.StockQuantity += stockEntry.Quantity;
            }
            else
            {
                medicine.StockQuantity += stockEntry.Quantity * medicine.BoxSize;
            }
            
            await _context.SaveChangesAsync();

            return StockEntry.Type == StockEntryType.Manual
                ? RedirectToPage("/Overview")
                : RedirectToPage("./DeductPrescription", new { mId = StockEntry.MedicineId, boxes = stockEntry.Quantity });
        }
    }
    
    public record StockEntryModel(Guid MedicineId, StockEntryType Type, [Required]int?  Quantity);
}
