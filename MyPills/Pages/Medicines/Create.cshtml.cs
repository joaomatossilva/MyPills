using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        public MedicineModel Medicine { get; set; } = default!;

        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var userId = User.GetUserId();
            var medicine = new Medicine
            {
                UserId = userId,
                Name = Medicine.Name,
                BoxSize = Medicine.BoxSize!.Value
            };
            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }

    public record MedicineModel(string Name, [Required]int? BoxSize);
}
