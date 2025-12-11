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
    public class DetailsModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DetailsModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

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
    }
}
