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
        public IList<StockEntry> StockEntry { get;set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userId = User.GetUserId();
            var medicine = await _context.Medicines.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);

            if (medicine is not null)
            {
                Medicine = medicine;
                
                StockEntry = await _context.StockEntries
                    .Include(s => s.Medicine)
                    .Where(x => x.MedicineId == id && x.UserId == userId)
                    .ToListAsync();

                return Page();
            }

            return NotFound();
        }
    }
}
