using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using MyPills.Data;

namespace MyPills.Pages.Medicines
{
    public class CreateModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public CreateModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public Medicine Medicine { get; set; } = default!;

        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Medicines.Add(Medicine);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
