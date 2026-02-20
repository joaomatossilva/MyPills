using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages.PM
{
    public class DeleteMedicineModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DeleteMedicineModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public PrescribedMedicine PrescribedMedicine { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id, Guid? mId)
        {
            if (id == null || mId == null)
            {
                return NotFound();
            }

            var prescribedmedicine = await _context.PrescribedMedicine.FirstOrDefaultAsync(m => m.PrescriptionId == id && m.MedicineId == mId);

            if (prescribedmedicine is not null)
            {
                PrescribedMedicine = prescribedmedicine;

                return Page();
            }

            return NotFound();
        }

        public async Task<IActionResult> OnPostAsync(Guid? id, Guid? mId)
        {
            if (id == null)
            {
                return NotFound();
            }

            var prescribedmedicine = await _context.PrescribedMedicine.FirstOrDefaultAsync(m => m.PrescriptionId == id && m.MedicineId == mId);
            
            if (prescribedmedicine != null)
            {
                PrescribedMedicine = prescribedmedicine;
                _context.PrescribedMedicine.Remove(PrescribedMedicine);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Details",  new { id });
        }
    }
}
