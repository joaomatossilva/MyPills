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
    public class DeleteModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DeleteModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Medicine Medicine { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userId = User.GetUserId();
            var medicine = await _context.Medicines.FirstOrDefaultAsync(m => m.Id == id &&  m.UserId == userId);

            if (medicine is not null)
            {
                Medicine = medicine;

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

            var userId = User.GetUserId();
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine != null &&  medicine.UserId == userId)
            {
                Medicine = medicine;
                _context.Medicines.Remove(Medicine);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
