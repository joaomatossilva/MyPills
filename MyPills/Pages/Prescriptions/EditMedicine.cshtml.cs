using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace MyPills.Pages.Prescriptions
{
    public class EditMedicineModel : PageModel
    {
        private readonly MyPills.Data.ApplicationDbContext _context;

        public EditMedicineModel(MyPills.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public int Quantity { get; set; }
        [BindProperty]
        public int ConsumedQuantity { get; set; }
        public Guid PrescriptionId { get; private set; }

        public async Task<IActionResult> OnGetAsync(Guid? id, Guid? mId)
        {
            if (id == null || mId == null)
            {
                return NotFound();
            }

            var prescribedmedicine = await _context.PrescribedMedicine.FirstOrDefaultAsync(m => m.PrescriptionId == id && m.MedicineId == mId);
            if (prescribedmedicine == null)
            {
                return NotFound();
            }
            Quantity = prescribedmedicine.Quantity;
            ConsumedQuantity = prescribedmedicine.ConsumedQuantity;
            PrescriptionId =  prescribedmedicine.PrescriptionId;
            return Page();
        }

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more information, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync(Guid? id, Guid? mId)
        {
            var prescribedmedicine = await _context.PrescribedMedicine.FirstOrDefaultAsync(m => m.PrescriptionId == id && m.MedicineId == mId);
            if (prescribedmedicine == null)
            {
                return NotFound();
            }
            
            PrescriptionId =  prescribedmedicine.PrescriptionId;
            if (!ModelState.IsValid)
            {
                return Page();
            }

            prescribedmedicine.Quantity = Quantity;
            prescribedmedicine.ConsumedQuantity = ConsumedQuantity;

            await _context.SaveChangesAsync();

            return RedirectToPage("./Details", new { id = prescribedmedicine.PrescriptionId });
        }
    }
}
