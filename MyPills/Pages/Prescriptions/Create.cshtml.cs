using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using MyPills.Data;

namespace MyPills.Pages.Prescriptions
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
        public PrescriptionModel Prescription { get; set; } = default!;

        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var userId = User.GetUserId();
            var prescription = new Prescription()
            {
                UserId = userId,
                Date = Prescription.Date.ToDateTime(TimeOnly.MinValue),
                ExpiryDate = Prescription.ExpiryDate.ToDateTime(TimeOnly.MinValue)
            };
            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }

    public class PrescriptionModel
    {
        public DateOnly Date { get; set; }
        public DateOnly ExpiryDate { get; set; }
    }
}
