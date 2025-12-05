using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages.Medicines
{
    public class DetailsModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DetailsModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public Medicine Medicine { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var medicine = await _context.Medicines.FirstOrDefaultAsync(m => m.Id == id);

            if (medicine is not null)
            {
                Medicine = medicine;

                return Page();
            }

            return NotFound();
        }
    }
}
