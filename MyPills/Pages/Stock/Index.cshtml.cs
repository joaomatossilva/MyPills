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
    public class IndexModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public IndexModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<StockEntry> StockEntry { get;set; } = default!;

        public async Task OnGetAsync()
        {
            StockEntry = await _context.StockEntries
                .Include(s => s.Medicine)
                .ToListAsync();
        }
    }
}
