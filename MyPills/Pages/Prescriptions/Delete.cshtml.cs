using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages.Prescriptions
{
    public class DeleteModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DeleteModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Prescription Prescription { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var prescription = await _context.Prescriptions.FirstOrDefaultAsync(m => m.Id == id);

            if (prescription is not null)
            {
                Prescription = prescription;

                return Page();
            }

            return NotFound();
        }

        public async Task<IActionResult> OnPostAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var prescription = await _context.Prescriptions.FindAsync(id);
            if (prescription != null)
            {
                Prescription = prescription;
                _context.Prescriptions.Remove(Prescription);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
