using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using MyPills.Data;

namespace MyPills.Pages.Prescriptions
{
    public class AddModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public AddModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult OnGet(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            PrescriptionId = id.Value;
            
            ViewData["MedicineId"] = new SelectList(_context.Medicines, "Id", "Name");
            return Page();
        }

        [BindProperty]
        public PrescribedMedicineModel PrescribedMedicine { get; set; } = default!;
        public Guid PrescriptionId { get; private set; }

        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            PrescriptionId = id.Value;

            if (!ModelState.IsValid)
            {
                ViewData["MedicineId"] = new SelectList(_context.Medicines, "Id", "Name");
                return Page();
            }

            var prescribedMedicine = new PrescribedMedicine
            {
                PrescriptionId = PrescriptionId,
                MedicineId = PrescribedMedicine.MedicineId,
                Quantity = PrescribedMedicine.Quantity,
                ConsumedQuantity = PrescribedMedicine.ConsumedQuantity
            };
            _context.PrescribedMedicine.Add(prescribedMedicine);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Details", new { id });
        }
    }

    public class PrescribedMedicineModel
    {
        public Guid MedicineId { get; set; }
        public int Quantity { get; set; }
        public int ConsumedQuantity { get; set; }
    }
}
