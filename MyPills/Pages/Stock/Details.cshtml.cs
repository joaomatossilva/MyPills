using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using MyPills.Data;

namespace MyPills.Pages.Stock
{
    public class DetailsModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public DetailsModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public StockEntry StockEntry { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }
            var userId = User.GetUserId();
            var stockentry = await _context.StockEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);

            if (stockentry is not null)
            {
                StockEntry = stockentry;

                return Page();
            }

            return NotFound();
        }
    }
}
